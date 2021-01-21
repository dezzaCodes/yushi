import yfinance as yf
import pandas as pd
import datetime as dt
import numpy as np
import math
from scipy.stats import norm

# Monte Carlo Simulation equations and values based off this phd paper
# http://www.diva-portal.se/smash/get/diva2:1214365/FULLTEXT01.pdf

# Resourced referenced for VaR and Expected Shortfalls calculations
# https://towardsdatascience.com/learn-to-calculate-your-portfolios-value-at-risk-e1e2c5c68456
# https://www.investopedia.com/articles/04/092904.asp
# https://en.wikipedia.org/wiki/Expected_shortfall
# https://www.mathworks.com/help/risk/value-at-risk-estimation-and-backtesting-1.html


def non_weighted_mean_std(data):
    return np.mean(data), np.std(data)


def weighted_mean_std(data):
    # filter out nans since average doesnt deal with them automatically
    filtered = data[~np.isnan(data)]

    alpha = 2 / (30+1)
    weights = [(1 - alpha) ** i for i in range(len(filtered), 0, -1)]
    average = np.average(filtered, weights=weights)
    variance = np.average((filtered-average)**2, weights=weights)
    return average, math.sqrt(variance)


def monte_carlo_basic(stock_code, period='5y', num_simulations=10, t_interval=365, mean_std_func=non_weighted_mean_std):
    try:
        data = yf.Ticker(stock_code+'.AX').history(period=period)['Close']
        returns = data.pct_change()
        expected_returns, volatility = mean_std_func(returns)
        sampling = np.random.normal(
            loc=0, scale=volatility, size=(t_interval+1, num_simulations))

        simulation = np.zeros_like(sampling)
        simulation[0] = data[-1]

        for i in range(1, t_interval + 1):
            simulation[i] = simulation[i - 1] * (1 + sampling[i])
        return simulation
    except Exception as err:
        print(err)
    return None


def monte_carlo_gbm(stock_code, period='5y', num_simulations=10, t_interval=365, mean_std_func=non_weighted_mean_std, time_step=1):
    try:
        data = yf.Ticker(stock_code+'.AX').history(period=period)['Close']
        returns = data.pct_change()
        u, std = mean_std_func(returns)
        n_prices = math.ceil(t_interval / time_step) + 1

        simulation = np.zeros((n_prices, num_simulations))
        simulation[0] = data[-1]
        for i in range(1, n_prices):
            drift = (u - ((std ** 2) / 2)) * time_step
            shock = std * \
                np.random.normal(0, 1, num_simulations) * (time_step ** 0.5)
            simulation[i] = simulation[i-1] * np.exp(drift + shock)
        return simulation
    except Exception as err:
        print(err)
    return None


def VaR_ES_historical_sim(portfolio, n_days=1, percentile=95, period='2y'):
    try:
        histories = pd.DataFrame()

        for code, quantity in portfolio.items():
            histories[code] = yf.Ticker(
                code+'.AX').history(period=period)['Close']

        histories['Port_Value'] = 0
        for code, quantity in portfolio.items():
            histories['Port_Value'] = histories[code] * \
                quantity + histories['Port_Value']

        histories['Perc_Change'] = histories['Port_Value'].pct_change()

        value_loc_for_percentile = round(
            len(histories) * (1 - (percentile / 100)))

        sortedhistories = histories.sort_values(by=['Perc_Change'])

        var_result = sortedhistories.iloc[value_loc_for_percentile +
                                          1]['Perc_Change'] * np.sqrt(n_days)
        var_result = None if np.isnan(var_result) else round(var_result, 5)

        expected_shortfall = sortedhistories['Perc_Change'].head(
            value_loc_for_percentile).mean(axis=0) * np.sqrt(n_days)
        expected_shortfall = None if np.isnan(expected_shortfall
                                              ) else round(expected_shortfall, 5)

        return var_result, expected_shortfall, histories
    except Exception as err:
        print(err)
    return None


def VaR_ES_variance_covariance(portfolio, n_days=1, percentile=95, period='2y'):
    try:
        histories = pd.DataFrame()

        for code, quantity in portfolio.items():
            histories[code] = yf.Ticker(
                code+'.AX').history(period=period)['Close']

        histories['Port_Value'] = 0
        for code, quantity in portfolio.items():
            histories['Port_Value'] = histories[code] * \
                quantity + histories['Port_Value']

        histories['Perc_Change'] = histories['Port_Value'].pct_change()
        u = np.mean(histories['Perc_Change'])
        std = np.std(histories['Perc_Change'])


        alpha = 1 - (percentile/100)

        var_result = norm.ppf(alpha, loc=u, scale=std) * np.sqrt(n_days)
        var_result = None if np.isnan(var_result) else round(var_result, 5)

        # loss of portfolio
        expected_shortfall = u + \
            std * (norm.pdf(norm.ppf(alpha, loc=u, scale=std) / (1-alpha), loc=u, scale=std))
        expected_shortfall = None if np.isnan(expected_shortfall
                                              ) else -round(expected_shortfall, 5)
        return var_result, expected_shortfall, histories
    except Exception as err:
        print(err)
    return None


def VaR_ES_monte_carlo(portfolio, n_days=1, percentile=95, period='2y', time_step=1, num_simulations=1000, use_weighted=False):
    try:
        histories = pd.DataFrame()
        for code, quantity in portfolio.items():

            histories[code] = yf.Ticker(
                code+'.AX').history(period=period)['Close']

        histories['Port_Value'] = 0
        for code, quantity in portfolio.items():
            histories['Port_Value'] = histories[code] * \
                quantity + histories['Port_Value']

        histories['Perc_Change'] = histories['Port_Value'].pct_change()

        # run monte carlo simulation using gbm
        last_port_value = histories.iloc[-1]['Port_Value']

        u, std = weighted_mean_std(histories['Perc_Change']) if use_weighted else non_weighted_mean_std(histories['Perc_Change'])
        n_prices = math.ceil(n_days / time_step) + 1

        simulation = np.zeros((n_prices, num_simulations))
        simulation[0] = last_port_value
        for i in range(1, n_prices):
            drift = (u - ((std ** 2) / 2)) * time_step
            shock = std * \
                np.random.normal(0, 1, num_simulations) * (time_step ** 0.5)
            simulation[i] = simulation[i-1] * np.exp(drift + shock)

        ending_prices = simulation[-1]

        # calculate percent change between the current port value & simulated ending prices
        simulated_endings = pd.DataFrame()
        simulated_endings['Ending_Prices'] = simulation[-1]
        simulated_endings['Perc_Change'] = simulated_endings / \
            last_port_value - 1

        # sort simulations by perc_change and determine what lies at percentile
        value_loc_for_percentile = round(
            len(simulated_endings) * (1 - (percentile / 100)))
        sortedSimulated = simulated_endings.sort_values(by=['Perc_Change'])

        var_result = sortedSimulated.iloc[value_loc_for_percentile +
                                          1]['Perc_Change'] * np.sqrt(n_days)
        var_result = None if np.isnan(var_result) else round(var_result, 5)
        expected_shortfall = sortedSimulated['Perc_Change'].head(
            value_loc_for_percentile).mean(axis=0) * np.sqrt(n_days)
        expected_shortfall = None if np.isnan(expected_shortfall
                                              ) else round(expected_shortfall, 5)
        return var_result, expected_shortfall, simulation, sortedSimulated
    except Exception as err:
        print(err)
    return None


if __name__ == '__main__':

    # s1 = monte_carlo_basic(stock_code='CBA')
    # print(s1[-1])
    # s1 = monte_carlo_basic(
    #     stock_code='CBA', mean_std_func=weighted_mean_std)
    # print(s1[-1])

    # print('geometric')
    # s2 = monte_carlo_gbm(stock_code='CBA')
    # print(s2[-1])

    # s2 = monte_carlo_gbm(
    #     stock_code='CBA', mean_std_func=weighted_mean_std)
    # print(s2[-1])

    # var, expected, data = VaR_ES_historical_sim({'CBA': 100, 'WOW': 50})
    # print('Value at risk is ', var)
    # print('Expected shortfall is ', expected)
    # print(data)

    # var, expected, histories = VaR_ES_variance_covariance({'CBA': 100, 'WOW': 50})
    # print('VaR: ', var)
    # print('Expected Shortfall ', expected)

    var, expected, sim, sorted_sim = VaR_ES_monte_carlo(
        {'CBA': 100, 'WOW': 50})
    print('VaR: ', var)
    print('Expected Shortfall ', expected)
    print(sorted_sim)

    pass
