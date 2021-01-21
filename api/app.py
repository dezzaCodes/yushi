from builtins import int, len

import bcrypt
from flask import Flask, request, jsonify, render_template, url_for, flash, abort, g, session, json

from sqlalchemy import func

from datetime import datetime, timedelta

from werkzeug.utils import redirect
import pandas as pd

from .db import db
from .models import User, Portfolio, Stock, Holding, GameHolding, Brief_Stock
from .helpers import fetchStockData, fetchStockHistory, Scraper
from .screener_helper import screenerHelper
from .prediction import get_prediction
from .monte_carlo import non_weighted_mean_std, weighted_mean_std, monte_carlo_basic, monte_carlo_gbm, VaR_ES_historical_sim, VaR_ES_variance_covariance, VaR_ES_monte_carlo

from flask import Flask
from flask_httpauth import HTTPBasicAuth
from flask_cors import CORS, cross_origin

# local file
from .types import types

app = Flask(__name__)

# sets location of database
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///demo.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = "should be random string"

db.init_app(app)


auth = HTTPBasicAuth()

with app.app_context():


    @app.route('/stocks', methods=['GET'])
    def get_stocks():
        stocks = Stock.query.all()
        return {'stocks': Stock.serialize_list(stocks)}
    #list the specific stock information
    @app.route('/stocks/<code>')
    def get_stock_detail(code):
        code = code.upper()
        stock = Stock.query.filter_by(code=code).first()
        # If stock doesnt exist or it hasnt been updated recently
        #   fetch stock data from other api
        if (stock is None):
            stock = fetchStockData(code)
            if (stock is None):
                return {'error': 'Stock not found'}, 404
            # save fetched stock data into database
            db.session.add(stock)
            db.session.commit()
        elif ((datetime.utcnow() - stock.last_fetched).days >= 1):
            newStock = fetchStockData(code)
            if (newStock is None):
                return {'error': 'Stock not found'}, 404
            # update fetched stock data into database
            newStock.last_fetched = datetime.utcnow()
            Stock.query.filter_by(code=code).update(newStock.serialize())
            db.session.commit()

        return {'stock': stock.serialize()}
    #list the history of specific stock
    @app.route('/stocks/<code>/history', methods=['GET'])
    def get_stock_history(code):
        history = fetchStockHistory(code)
        if (history is None):
            return {'error': 'Stock not found'}, 404
        history = json.loads(history.to_json(
            orient='records', date_format='iso'))
        return {'history': history}

    @app.route('/companies', methods=['GET'])
    def get_ASX_companies():
        return '{"companies": ' + Scraper().get_all_companies() + '}'

    #list the sotred top gainners
    @app.route('/analytics/top-gainers', methods=['GET'])
    def get_top_gainers():
        s = Scraper()
        gainers = s.get_top_gainers()
        return {'gainers': gainers}
    #list the sorted top declines 
    @app.route('/analytics/top-declines', methods=['GET'])
    def get_top_declines():
        s = Scraper()
        declines = s.get_top_declines()
        return {'declines': declines}
    #list the top gain comppanies
    @app.route('/analytics/top-companies', methods=['GET'])
    def get_top_companies():
        s = Scraper()
        companies = s.get_top_companies()
        return {'companies': companies}

    # list the industry indices
    @app.route('/analytics/industry-indices', methods=['GET'])
    def get_industry_indices():
        s = Scraper()
        industries = s.get_industry_indices()
        return {'industries': industries}
    
    #load screener
    def load_screener():
        s = screenerHelper()
        # Save data into databse
        ticker_list = s.get_tickers()
        for i in ticker_list:
            screen_stock = s.save_data(i)
            db.session.add(screen_stock)
        db.session.commit()
        print("done")

        return {'screen_stock': screen_stock.serialize()}

    # update screener
    def update_screener():
        s = screenerHelper()

        # Save data into databse
        ticker_list = s.get_tickers()

        for i in ticker_list:
            screen_stock = s.save_data(i) 
            Brief_Stock.query.filter_by(code = i).update(screen_stock.serialize())  
        db.session.commit()
        print("done")

        return {'screen_stock': screen_stock.serialize()}

    #list stocks 
    @app.route('/analytics/screener', methods = ['POST'])
    def get_screener():
        s = screenerHelper()
        value = request.json.get('strat_value')
        div_val = request.json.get('div_Yield')
        PE_val = request.json.get('PE_value')
        ROE_val = request.json.get('ROE_value')

        if (div_val[0] == 0 and div_val[1] == 0):
            div_val = None
        if (PE_val[0] == 0 and PE_val[1] == 0):
            PE_val = None
        if (ROE_val[0] == 0 and ROE_val[1] == 0):
            ROE_val = None
        

        # print(stock_code, period, num_simulations, t_interval)
        if not (value):
            return 'Missing Inputs. Insert valid strategy', 422

        temp = Brief_Stock.query.first()
        if temp is None:
            load_screener()
        elif ((datetime.utcnow()-temp.last_fetched).days >= 90):    #update every quarter
            update_screener()

        # Get market P/E Ratio
        market_PE = db.engine.execute("select avg(round(PE_value,2)) from brief__stock;")
        market_PE = market_PE.first()[0]
        
        if (value == 'yield'):
            result = Brief_Stock.query.filter(Brief_Stock.div_yield > 0.052, Brief_Stock.string_market_cap == 'large').all()
        elif (value == 'growth'):
            result = Brief_Stock.query.filter(Brief_Stock.ROE > 0.1,
                                            Brief_Stock.PE_value < market_PE).all()
        elif (value == 'value'):
            result = Brief_Stock.query.filter(Brief_Stock.PE_value < market_PE).all()
        elif (value == 'custom'):
            if (div_val is None and PE_val is None and ROE_val is None):
                result = Brief_Stock.query.filter(Brief_Stock.PE_value < 99999).all()
            elif (PE_val is None and div_val and ROE_val is None):
                result = Brief_Stock.query.filter(Brief_Stock.div_yield.between(div_val[0],div_val[1]), 
                                                    Brief_Stock.PE_value.between(-999999, 999999)).all()
            elif (PE_val and div_val is None and ROE_val is None):
                result = Brief_Stock.query.filter(Brief_Stock.PE_value.between(PE_val[0],PE_val[1])).all()
            elif (PE_val is None and div_val is None and ROE_val):
                result = Brief_Stock.query.filter(Brief_Stock.ROE.between(ROE_val[0],ROE_val[1]),
                                                    Brief_Stock.PE_value.between(-999999, 999999)).all()
            elif (PE_val is None and div_val and ROE_val):
                result = Brief_Stock.query.filter(Brief_Stock.div_yield.between(div_val[0],div_val[1]), 
                                                    Brief_Stock.ROE.between(ROE_val[0],ROE_val[1])).all()
            elif (PE_val and div_val and ROE_val is None):
                result = Brief_Stock.query.filter(Brief_Stock.PE_value.between(PE_val[0],PE_val[1]), 
                                                    Brief_Stock.div_yield.between(div_val[0],div_val[1])).all()
            elif (PE_val and div_val is None and ROE_val):
                result = Brief_Stock.query.filter(Brief_Stock.PE_value.between(PE_val[0],PE_val[1]), 
                                                    Brief_Stock.ROE.between(ROE_val[0],ROE_val[1])).all()
            elif (PE_val and div_val and ROE_val):
                result = Brief_Stock.query.filter(Brief_Stock.PE_value.between(PE_val[0],PE_val[1]), 
                                                    Brief_Stock.div_yield.between(div_val[0],div_val[1]),
                                                    Brief_Stock.ROE.between(ROE_val[0],ROE_val[1])).all()
        return {'result': Brief_Stock.serialize_list(result)}

    #register for user 
    #email and password required 
    @app.route('/api/auth/register', methods=['POST'])
    def register():
        email = request.json.get('email')
        password = request.json.get('password')
        if email is None or password is None:
            abort(400)    # missing arguments
        if User.query.filter_by(email=email).first() is not None:
            return (jsonify({'msg': types.REG_FAILURE}))
        hashpw = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

        user = User(email=email, password=hashpw)
        db.session.add(user)
        db.session.commit()
        token = user.generate_auth_token().decode("utf-8")
        return (jsonify({'email': email, 'msg': types.REG_SUCCESS, 'token': token, 'id': user.id}))

    #login
    # email and password required    
    @app.route('/api/auth/login', methods=['POST'])
    def login():
        email = request.json.get('email')
        password = request.json.get('password')
        if email is None or password is None:
            abort(400)    # missing arguments
        user = User.query.filter_by(email=email).first()
        if user is not None:
            hashpw = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
            bytePW = bytes(user.password, 'utf-8')
            if bcrypt.hashpw(bytes(password, 'utf-8'), bytePW) == bytePW:
                #
                for user in User.query.all():
                    print(user.email)
                    print(user.password)

                for holding in user.game_portfolio:
                    print(user.email)
                    print(holding)
                    # holding.stock.price = fetchStockData(holding.stock_code).price
                    # print(holding.stock.price)
                # db.session.commit()

                token = user.generate_auth_token().decode("utf-8")
                return (jsonify({'email': email, 'msg': types.LOGIN_SUCCESS, 'token': token, 'id': user.id}))
        return (jsonify({'msg': types.LOGIN_FAILURE}))

    #returns user
    #token required
    @app.route('/api/auth/user', methods=['POST'])
    def get_user_token():
        authorization_header = request.headers.get('Authorization')

        # Check if Authorization header exists
        if (authorization_header is None):
            return "No token present in 'Authorization' header", 403

        # Parse token from header => Authorization: 'Token {this is the token to decode}'
        bearer_header = authorization_header.split(' ')
        if (len(bearer_header) != 2):
            return "Invalid token format", 403
        token = bearer_header[1]

        user = User.verify_auth_token(token)
        if user is None:
            return (jsonify({'msg': types.USER_NOT_FOUND})), 403
        return {'email': user.email, 'id': user.id, 'token':token, 'msg': types.USER_FOUND}, 200

    #return user
    #id required
    @app.route('/api/users/<int:id>' ,methods=['GET'])
    def get_user(id):
        user = User.query.get(id)
        if not user:
            abort(400)
        return jsonify({'username': user.email})
    
    #user password change 
    #id required
    @app.route('/api/passChange',methods=['POST'])
    def user_password_change():
        id = request.json.get('userId')
        new_password = request.json.get('newPass')
        hashpw = bcrypt.hashpw(new_password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        new_password = hashpw
        user = User.query.filter_by(id=id).first()
        if user is None:
            abort(400)
        if user is not None:
            user.password = new_password
            db.session.commit()
        return jsonify({'msg':'password change success'})

    #return the cash of user 
    #id required
    @app.route('/api/users/<int:id>/cash', methods=['GET'])
    def get_cash(id):
        user = User.query.get(id)
        if not user:
            abort(400)
        return jsonify({'cash': user.cash})

    #list all users
    @app.route('/api/users', methods=['GET'])
    def get_users():
        users = User.query.all()
        return {'users': User.serialize_list(users)}

    #########################################
    #                                       #
    #       PORTFOLIO HELPER FUNCTIONS      #
    #                                       #
    #########################################

    # Helper function to authorize user
    def check_authorization(request):
        authorization_header = request.headers.get('Authorization')

        # Check if Authorization header exists
        if (authorization_header is None):
            return {'error': {'status': 403, 'message': "No token present in 'Authorization' header"}}

        # Parse token from header => Authorization: 'Token {this is the token to decode}'
        bearer_header = authorization_header.split(' ')
        if (len(bearer_header) != 2):
            return {'error': {'status': 403, 'message': "Invalid token format"}}
        token = bearer_header[1]
        user = User.verify_auth_token(token)
        if (user is None):
            return {'error': {'status': 403, 'message': "Invalid token or token expired"}}
        return {'user': user}

    #update the stock 
    def check_stock_to_update(code):
        stock = Stock.query.filter_by(code=code).first()
        # if last time this stock has been fetched more than a day, need to update price!!
        if (datetime.now() - stock.last_fetched > timedelta(days=1)):
            newStock = fetchStockData(stock.code)
            if (newStock is None):
                # could not update...
                return
            # update fetched stock data into database
            newStock.last_fetched = datetime.utcnow()
            Stock.query.filter_by(code=stock.code).update(
                newStock.serialize())
            db.session.commit()
    
    def calculate_holding_performance(holding):
        check_stock_to_update(holding.stock)

        price_bought = float(holding.price) * float(holding.quantity)
        current_worth = float(holding.stock.price) * float(holding.quantity)
        net_worth = current_worth - price_bought
        prev_worth = float(holding.stock.previous_close) * \
            float(holding.quantity)
        prev_net_worth = prev_worth - price_bought

        change = current_worth - prev_worth
        change_percent = round(current_worth / prev_worth *
                               100 - 100, 3) if prev_worth != 0 else None
        return {'holding_id': holding.id, 'current_worth': round(current_worth, 3), 'net_worth': round(net_worth, 3),
                'prev_worth': round(prev_worth, 3), 'prev_net_worth': round(prev_net_worth, 3),
                'change': round(change, 3), 'change_percent': change_percent}

    def calculate_holding_group_performance(code, holdings):
        check_stock_to_update(code)

        stock = Stock.query.filter_by(code=code).first()
        price_bought = sum(float(h.price) * float(h.quantity)
                           for h in holdings)
        total_quantity = sum(h.quantity for h in holdings)
        current_worth = total_quantity * float(stock.price)
        net_worth = current_worth - price_bought
        net_worth_percent = round(
            current_worth / price_bought * 100 - 100, 3) if price_bought != 0 else None
        prev_worth = float(stock.previous_close) * float(total_quantity)
        prev_net_worth = prev_worth - price_bought
        change = current_worth - prev_worth
        change_percent = round(
            current_worth / prev_worth * 100 - 100, 3) if prev_worth != 0 else None

        return {'code': code, 'holdings': [h.id for h in holdings], 'current_worth': round(current_worth, 3), 'net_worth': round(net_worth, 3),
                'prev_worth': round(prev_worth, 3), 'prev_net_worth': round(prev_net_worth, 3), 'total_quantity': total_quantity,
                'change': round(change, 3), 'change_percent': change_percent, 'price_bought': price_bought, 'net_worth_percent': net_worth_percent}

    def calculate_portfolio_performance(portfolio):
        # group all the holdings by stock code
        codes = {}
        for holding in portfolio.holdings:
            group = codes.get(holding.stock_code, [])
            group.append(holding)
            codes[holding.stock_code] = group

        holding_performances = [calculate_holding_group_performance(
            k, v) for (k, v) in codes.items()]

        # sum up all holding performances
        current_worth = 0
        net_worth = 0
        prev_worth = 0
        prev_net_worth = 0
        for p in holding_performances:
            current_worth += p['current_worth']
            net_worth += p['net_worth']
            prev_worth += p['prev_worth']
            prev_net_worth += p['prev_net_worth']

        change = current_worth - prev_worth
        change_percent = round(
            current_worth / prev_worth * 100 - 100, 3) if prev_worth != 0 else None

        return {'portfolio_id': portfolio.id, 'portfolio_name': portfolio.name, 'holding_performances': holding_performances,
                'current_worth': round(current_worth, 3), 'net_worth': round(net_worth, 3), 'prev_worth': round(prev_worth, 3),
                'prev_net_worth': round(prev_net_worth, 3), 'change': round(change, 3), 'change_percent': change_percent}

    def calculate_holding_historical_performance(holding):
        price_bought = float(holding.price) * float(holding.quantity)

        history = fetchStockHistory(holding.stock_code, start=holding.date, period=None)
        if history is None:
            return {'holding_id': holding.id, 'performance': None, 'price_bought': round(price_bought, 3), 'date_bought': holding.date.strftime("%Y-%m-%d")}

        # calculate performance
        history['current_worth'] = history['close'] * holding.quantity
        history['total_change'] = history['current_worth'] - price_bought
        history['total_change_percent'] = round(
            history['current_worth'] / price_bought * 100 - 100, 3) if price_bought != 0 else None
        history['prev_worth'] = history['current_worth'].shift(1)
        history['prev_worth'].fillna(0, inplace=True)
        history['daily_change'] = history['current_worth'] - \
            history['prev_worth']
        history['daily_change_percent'] = round(
            history['current_worth'] / history['prev_worth'] * 100 - 100, 3)

        # jsonify dataframe
        performance = json.loads(history.to_json(
            orient='records', date_format='iso'))

        return {'holding_id': holding.id, 'performance': performance, 'price_bought': round(price_bought, 3), 'date_bought': holding.date.strftime("%Y-%m-%d")}

    def calculate_holding_group_historical_performance(code, holdings):
        # find maximum date there is
        date_all_stocks_exist = max(
            [h.date for h in holdings], default=datetime.now())

        price_bought = sum(float(h.price) * float(h.quantity)
                           for h in holdings)
        total_quantity = sum(h.quantity for h in holdings)

        history = fetchStockHistory(code, start=date_all_stocks_exist, period=None)
        if history is None:
            return {'code': code, 'holdings': [h.id for h in holdings], 'performance': None, 'price_bought': round(price_bought, 3)}

        # calculate performance
        history['current_worth'] = history['close'] * total_quantity
        history['total_change'] = history['current_worth'] - price_bought
        history['total_change_percent'] = round(
            history['current_worth'] / price_bought * 100 - 100, 3) if price_bought != 0 else None
        history['prev_worth'] = history['current_worth'].shift(1)
        history['prev_worth'].fillna(price_bought, inplace=True) # fill in null values with 0
        history['daily_change'] = history['current_worth'] - \
            history['prev_worth']
        history['daily_change_percent'] = round(
            history['current_worth'] / history['prev_worth'] * 100 - 100, 3)

        # jsonify dataframe
        performance = json.loads(history.to_json(
            orient='records', date_format='iso'))

        return {'code': code, 'holdings': [h.id for h in holdings], 'performance': performance, 'price_bought': round(price_bought, 3)}

    def calculate_portfolio_historical_performance(portfolio):
        # group all the holdings by stock code
        codes = {}
        for holding in portfolio.holdings:
            group = codes.get(holding.stock_code, [])
            group.append(holding)
            codes[holding.stock_code] = group

        holding_performance = [calculate_holding_group_historical_performance(
            k, v) for (k, v) in codes.items()]

        errors = []
        performance = {}
        for h in holding_performance:
            if not h['performance']:
                errors.append(
                    'Could not get historical performance of stock ' + str(h['code']) + ' so it is not included into calculation')
                continue
            for entry in h['performance']:
                p_entry = performance.get(entry['date'], {
                                          'current_worth': 0, 'total_change': 0, 'date': entry['date'], 'prev_worth': 0})
                p_entry['current_worth'] += entry['current_worth']
                p_entry['total_change'] += entry['total_change']
                p_entry['prev_worth'] += entry['prev_worth']
                performance[entry['date']] = p_entry

        # calculate total_change_percent & daily_change & daily_change_percent
        for k, v in performance.items():
            v['total_change_percent'] = round(
                v['current_worth'] / (v['current_worth'] - v['total_change']) * 100 - 100, 3) if v['current_worth'] - v['total_change'] != 0 else None
            v['daily_change'] = round(v['current_worth'] - v['prev_worth'], 3)
            v['daily_change_percent'] = round(
                v['current_worth'] / v['prev_worth'] * 100 - 100, 3) if v['prev_worth'] != 0 else None

        if len(errors) > 0:
            return {'portfolio_id': portfolio.id, 'portfolio_name': portfolio.name, 'holding_performance': holding_performance, 'performance': performance, 'errors': errors}
        return {'portfolio_id': portfolio.id, 'portfolio_name': portfolio.name, 'holding_performance': holding_performance, 'performance': performance}

    ###########################################
    #                                         #
    #       PORTFOLIO PERFORMANCE ROUTES      #
    #                                         #
    ###########################################
    #return portfolio performance
    #token required
    @app.route('/portfolios/performance', methods=['GET'])
    def get_total_portfolio_performance():
        result = check_authorization(request)
        if (result.get('error') is not None):
            return result['error']['message'], result['error']['status']

        user = result.get('user')

        portfolio_performances = [
            *map(calculate_portfolio_performance, user.portfolios)]

        # sum up all holding performances
        current_worth = 0
        net_worth = 0
        prev_worth = 0
        prev_net_worth = 0
        for p in portfolio_performances:
            current_worth += p['current_worth']
            net_worth += p['net_worth']
            prev_worth += p['prev_worth']
            prev_net_worth += p['prev_net_worth']

        change = current_worth - prev_worth
        change_percent = round(
            current_worth / prev_worth * 100 - 100, 3) if prev_worth != 0 else None

        return {'current_worth': round(current_worth, 3), 'net_worth': round(net_worth, 3), 'prev_worth': round(prev_worth, 3),
                'prev_net_worth': round(prev_net_worth, 3), 'change': round(change, 3), 'change_percent': change_percent,
                'portfolio_performances': portfolio_performances}, 200

    #return portfolio performance of specific stock
    #portfolio id required
    @app.route('/portfolios/<pid>/performance', methods=['GET'])
    def get_portfolio_performance(pid):
        result = check_authorization(request)
        if (result.get('error') is not None):
            return result['error']['message'], result['error']['status']
        user = result.get('user')
        portfolio = next(
            iter([p for p in user.portfolios if str(p.id) == str(pid)]), None)
        if not portfolio:
            return 'Portfolio not found', 404
        return calculate_portfolio_performance(portfolio), 200

    @app.route('/portfolios/<pid>/holdings/<hid>/performance')
    def get_holding_performance(pid, hid):
        result = check_authorization(request)
        if (result.get('error') is not None):
            return result['error']['message'], result['error']['status']
        user = result.get('user')
        portfolio = next(
            iter([p for p in user.portfolios if str(p.id) == str(pid)]), None)
        if not portfolio:
            return 'Portfolio not found', 404
        holding = next(
            iter([h for h in portfolio.holdings if str(h.id) == str(hid)]), None)
        if not holding:
            return 'Holding not found', 404

        return calculate_holding_performance(holding), 200

    @app.route('/portfolios/<pid>/holding-group/<code>/performance')
    def get_holding_group_performance(pid, code):
        result = check_authorization(request)
        if (result.get('error') is not None):
            return result['error']['message'], result['error']['status']
        user = result.get('user')
        portfolio = next(
            iter([p for p in user.portfolios if str(p.id) == str(pid)]), None)
        if not portfolio:
            return 'Portfolio not found', 404
        code = code.upper()
        holdings = [h for h in portfolio.holdings if str(
            h.stock_code.upper()) == str(code.upper())]
        if (len(holdings) == 0):
            return 'No holdings with stock code of ' + code.upper() + ' found', 404
        return calculate_holding_group_performance(code, holdings), 200

    @app.route('/portfolios/<pid>/holdings/<hid>/historical-performance')
    def get_holding_performance_full(pid, hid):
        result = check_authorization(request)
        if (result.get('error') is not None):
            return result['error']['message'], result['error']['status']
        user = result.get('user')
        portfolio = next(
            iter([p for p in user.portfolios if str(p.id) == str(pid)]), None)
        if not portfolio:
            return 'Portfolio not found', 404
        holding = next(
            iter([h for h in portfolio.holdings if str(h.id) == str(hid)]), None)
        if not holding:
            return 'Holding not found', 404

        historical_performance = calculate_holding_historical_performance(
            holding)
        if not historical_performance:
            return 'Could not get historical performance of holding with id: ' + holding.id, 500
        return calculate_holding_historical_performance(holding), 200

    @app.route('/portfolios/<pid>/holding-group/<code>/historical-performance')
    def get_holding_group_performance_full(pid, code):
        result = check_authorization(request)
        if (result.get('error') is not None):
            return result['error']['message'], result['error']['status']
        user = result.get('user')
        portfolio = next(
            iter([p for p in user.portfolios if str(p.id) == str(pid)]), None)
        if not portfolio:
            return 'Portfolio not found', 404
        code = code.upper()
        holdings = [h for h in portfolio.holdings if str(
            h.stock_code.upper()) == str(code)]
        if (len(holdings) == 0):
            return 'No holdings with stock code of ' + code + ' found', 404
        return calculate_holding_group_historical_performance(code, holdings)

    @app.route('/portfolios/<pid>/historical-performance')
    def get_portfolio_performance_full(pid):
        result = check_authorization(request)
        if (result.get('error') is not None):
            return result['error']['message'], result['error']['status']
        user = result.get('user')
        portfolio = next(
            iter([p for p in user.portfolios if str(p.id) == str(pid)]), None)
        if not portfolio:
            return 'Portfolio not found', 404

        historical_performance = calculate_portfolio_historical_performance(
            portfolio)
        return historical_performance, 200

    ###############################
    #                             #
    #       PORTFOLIO ROUTES      #
    #                             #
    ###############################

    @app.route('/portfolios', methods=['GET'])
    def get_portfolios():
        result = check_authorization(request)
        if (result.get('error') is not None):
            return result['error']['message'], result['error']['status']
        return result.get('user').serialize(), 200

    @app.route('/portfolios/<id>', methods=['GET'])
    def get_portfolio(id):
        result = check_authorization(request)
        if (result.get('error') is not None):
            return result['error']['message'], result['error']['status']

        # filter out the one with the id
        user = result.get('user')
        portfolio = Portfolio.query.filter_by(
            id=id, user_id=user.id).first()

        if not portfolio:
            return 'Portfolio not found', 404

        return {'portfolio': portfolio.serialiseNoCollector()}, 200

    @app.route('/portfolios', methods=['POST'])
    def create_portfolio():
        result = check_authorization(request)
        if (result.get('error') is not None):
            return result['error']['message'], result['error']['status']

        # fetch user and name of portfolio
        user_id = result.get('user').id
        name = request.json.get('name')

        # validate name
        if not name:
            return 'Name is required', 422
        if not name.isalnum():
            return "Portfolio name must only be letters and numbers.", 422
        if len(name) > 254:
            return "Portfolio name must be less than 254 characters long.", 422

        # find user and add portfolio
        portfolio = Portfolio(name=name, user_id=user_id)

        # commit changes to db
        db.session.add(portfolio)
        db.session.commit()

        # return newly create portfolio
        return {'portfolio': portfolio.serialiseNoCollector()}, 200

    @app.route('/portfolios/<id>/edit', methods=['POST'])
    def edit_portfolio(id):
        result = check_authorization(request)
        if (result.get('error') is not None):
            return result['error']['message'], result['error']['status']

        # fetch user and name of portfolio
        user_id = result.get('user').id
        name = request.json.get('name')

        if not name:
            return 'Name is required', 422
        if not name.isalnum():
            return "Portfolio name must only be letters and numbers.", 422
        if len(name) > 254:
            return "Portfolio name must be less than 254 characters long.", 422

        # edit portfolio
        portfolio = Portfolio.query.filter_by(id=id, user_id=user_id).first()
        if not portfolio:
            return 'Portfolio not found', 404
        portfolio.name = name

        # commit changes to db
        db.session.commit()

        # return edited portfolio
        return {'portfolio': portfolio.serialiseNoCollector()}, 200

    @app.route('/portfolios/<id>/delete', methods=['POST'])
    def delete_portfolio(id):
        result = check_authorization(request)
        if (result.get('error') is not None):
            return result['error']['message'], result['error']['status']

        user_id = result.get('user').id

        # delete portfolio
        portfolio = Portfolio.query.filter_by(id=id, user_id=user_id).first()
        if not portfolio:
            return 'Portfolio not found', 404

        db.session.delete(portfolio)

        # commit changes to db
        db.session.commit()

        return 'Portfolio Successfully deleted', 200

    @app.route('/portfolios/<id>', methods=['POST'])
    def add_holding(id):

        result = check_authorization(request)
        if (result.get('error') is not None):
            return result['error']['message'], result['error']['status']

        user_id = result.get('user').id

        # get portfolio with this id
        portfolio = Portfolio.query.filter_by(id=id, user_id=user_id).first()
        if not portfolio:
            return 'Portfolio not found', 404

        # fetch and validate form data
        stock_code = request.json.get('stock_code')
        stock = Stock.query.filter_by(code=stock_code).first()
        if not stock:
            # need to create a stock entry for this stock code.... if it exists
            stock = fetchStockData(stock_code)
            if stock is None:
                return 'Invalid stock code', 422
            db.session.add(stock)
            db.session.commit()

        price = request.json.get('price')
        if not price or float(price) < 0:
            return 'Price is required and must be a number equal or above 0', 422
        quantity = request.json.get('quantity')
        if not quantity or int(quantity) <= 0:
            return 'Quantity is required and must be an integer above 0', 422
        date = request.json.get('date')
        if date:
            date = datetime.fromisoformat(date)

        holding = Holding(stock_code=stock.code, portfolio_id=id, price=price,
                          quantity=quantity) if not date else Holding(stock_code=stock.code, portfolio_id=id, price=price,
                                                                      quantity=quantity, date=date)

        # commit changes to db
        db.session.add(holding)
        db.session.commit()

        # return newly created holding
        return {'holding': holding.serialiseNoCollector()}, 200

    @app.route('/portfolios/<pid>/holdings/<hid>/delete', methods=['POST'])
    def remove_holding(pid, hid):
        result = check_authorization(request)
        if (result.get('error') is not None):
            return result['error']['message'], result['error']['status']

        user_id = result.get('user').id

        # get portfolio with this id
        portfolio = Portfolio.query.filter_by(id=pid, user_id=user_id).first()
        if not portfolio:
            return 'Portfolio not found', 404

        # get holding with this id
        holding = Holding.query.filter_by(id=hid, portfolio_id=pid).first()
        if not holding:
            return 'Holding not found', 404

        db.session.delete(holding)

        # commit changes to db
        db.session.commit()

        return 'Holding successfully deleted', 200

    #neural net integration

    @app.route('/analytics/predict', methods=['POST'])
    def predict():
        if request.method == 'POST':
            code = request.json.get('code')
            try:
                output, pred = get_prediction(code)
                return {"output": output, "prediction": pred}
            except:
                return 'Failed to run because of invalid stock codes', 422


    ##########################
    #          GAME           #
    ##########################

    #add game holding
    #token required
    @app.route('/game/add', methods=['POST'])
    def add_game_holding():
        result = check_authorization(request)
        if (result.get('error') is not None):
            return result['error']['message'], result['error']['status']

        user_id = result.get('user').id

        stock_code = request.json.get('stock_code')
        stock = Stock.query.filter_by(code=stock_code).first()
        if not stock:
            # need to create a stock entry for this stock code.... if it exists
            stock = fetchStockData(stock_code)
            if stock is None:
                return 'Invalid stock code', 422
            db.session.add(stock)

        else:
            stock.price = fetchStockData(stock_code).price

        db.session.commit()

        quantity = request.json.get('quantity')
        if not quantity or int(quantity) <= 0:
            return 'Quantity is required and must be an integer above 0', 422


        game_holding = GameHolding(user_id=user_id, stock_code=stock_code, price=stock.price, quantity=quantity, stock=stock)
        user = User.query.filter_by(id=user_id).first()
        user.game_portfolio.append(game_holding)

        user = User.query.filter_by(id=user_id).first()
        if user.cash < float(quantity) * float(stock.price) + 10:
            return 'Not enough money', 422
        user.cash = round(user.cash - float(quantity) * float(stock.price), 2) - 10

        # commit changes to db
        db.session.add(game_holding)
        db.session.commit()

        return {'game_holding': game_holding.serialiseNoCollector()}, 200

    # return the value of all holdings
    #id required
    @app.route('/game/<int:id>/value', methods=['GET'])
    def game_holding_value(id):
        user_id = id

        user = User.query.filter_by(id=user_id).first()

        totalValue = 0
        for holding in user.game_portfolio:
            totalValue += holding.stock.price * holding.quantity

        totalValue = round(totalValue, 2)

        return {"value": totalValue}, 200

    # reset the game infomation
    # id required
    @app.route('/game/<int:id>/reset',methods=['POST'])
    def game_reset(id):
        currUser = User.query.filter_by(id=id).first()

        currUser.cash = 50000
        currUser.game_portfolio.clear()
        db.session.commit()
        return {"msg":"successful"}, 200

    #sell the game holdings
    #token required
    @app.route('/game/sell', methods=['POST'])
    def sell_game_holding():
        result = check_authorization(request)
        if (result.get('error') is not None):
            return result['error']['message'], result['error']['status']

        quantity = int(request.json.get('quantity'))
        game_holding_id = request.json.get('id')
        game_holding = GameHolding.query.filter_by(id=game_holding_id).first()
        stock = Stock.query.filter_by(code=game_holding.stock_code).first()
        game_holding_copy = GameHolding(id=game_holding.id, user_id=game_holding.user_id,
                                        stock_code=game_holding.stock_code, price=game_holding.price, quantity=0,
                                        stock=stock)

        if game_holding.quantity < quantity:
            return 'Not enough stocks', 422
        game_holding.quantity = game_holding.quantity - quantity

        game_holding.stock.price = fetchStockData(game_holding.stock_code).price

        user_id = result.get('user').id
        user = User.query.filter_by(id=user_id).first()
        user.cash = round(user.cash + float(quantity) * float(game_holding.stock.price), 2) - 10

        if game_holding.quantity == 0:
            db.session.delete(game_holding)
            game_holding = game_holding_copy

        db.session.commit()

        return {'game_holding': game_holding.serialiseNoCollector()}, 200

    #return the top 1 game user and his value
    @app.route('/game/leader', methods=['GET'])
    def get_leader():
        users = User.query.all()
        winVal = 0
        for user in users:
            value = user.cash
            for holding in user.game_portfolio:
                value += holding.stock.price * holding.quantity
            if value > winVal and (len(user.game_portfolio) != 0 or value != 50000):
                winVal = value
                winner = user.email.split('@')[0]

        return jsonify({'winner': winner, 'value': winVal})

    #return the leaderboard
    @app.route('/game/leaderboard', methods=['GET'])
    def get_leaderboard():
        users = User.query.all()

        leaderDict = {}
        for user in users:
            value = user.cash
            for holding in user.game_portfolio:
                value += holding.stock.price * holding.quantity
            if len(user.game_portfolio) != 0:
                leaderDict[user.email.split('@')[0]] = value

        leaderDict = sorted(leaderDict.items(), key=lambda x: x[1], reverse=True)

        return jsonify({'dict': leaderDict})

    #return the rank of specific user
    #id required
    @app.route('/game/<int:id>/rank', methods=['GET'])
    def get_rank(id):
        users = User.query.all()
        currUser = User.query.filter_by(id=id).first()


        currUserVal = currUser.cash
        for holding in currUser.game_portfolio:
            currUserVal += holding.stock.price * holding.quantity

        if len(currUser.game_portfolio) == 0 and currUserVal == 50000:
            return jsonify({'rank': "-"})

        rank = 1
        for user in users:
            value = user.cash
            for holding in user.game_portfolio:
                value += holding.stock.price * holding.quantity
            if value > currUserVal and (len(user.game_portfolio) != 0 or value != 50000):
                rank += 1

        return jsonify({'rank': rank})


    ##########################
    #    Analytical tools    #
    ##########################

    @app.route('/analytics/monte-carlo-sim', methods=['POST'])
    def run_monte_carlo_sim():
        stock_code = request.json.get('stock_code')
        period = request.json.get('period')
        num_simulations = request.json.get('num_simulations')
        t_interval = request.json.get('t_interval')

        if not (stock_code and period and num_simulations and t_interval):
            return 'Missing Inputs. Need stock_code, period, num_simulations, t_interval', 422

        use_weighted = request.json.get('use_weighted')
        mean_std_func = weighted_mean_std if use_weighted else non_weighted_mean_std
        use_gbm = request.json.get('use_gbm')

        if use_gbm:
            time_step = request.json.get('time_step')
            if not time_step:
                return 'Missing Inputs. Need stock_code, period, num_simulation, t_interval, time_step', 422

            simulation = monte_carlo_gbm(
                stock_code, period, num_simulations, t_interval, mean_std_func, time_step)

            df = pd.DataFrame(simulation)
            df.columns = list(map(lambda x: 'simulation ' + str(x), df.columns))
            df.index = list(map(lambda x: x * time_step, df.index))
            sim_json = json.loads(df.to_json(orient='index'))
            return sim_json, 200

        else:

            simulation = monte_carlo_basic(
                stock_code, period, num_simulations, t_interval, mean_std_func)

            df = pd.DataFrame(simulation)
            df.columns = list(map(lambda x: 'simulation ' + str(x), df.columns))
            sim_json = json.loads(df.to_json(orient='index'))
            return sim_json, 200

    @app.route('/analytics/VaR-ES-sim', methods=['POST'])
    def run_VaR_ES_sim():
        portfolio = request.json.get('portfolio')
        n_days = request.json.get('n_days')
        percentile = request.json.get('percentile')
        period = request.json.get('period')
        method = request.json.get('method')
        if method == 'historical':
            result = VaR_ES_historical_sim(
                portfolio, n_days, percentile, period)
            if result is None:
                return 'Failed to run because of invalid stock codes', 422
            VaR, expected_shortfall, data = result

            # convert data into json
            data['date'] = data.index
            data_json = json.loads(data.to_json(
                orient='records', date_format='iso'))
            return {'VaR': VaR, 'expected_shortfall': expected_shortfall, 'data': data_json}, 200
        if method == 'covariance':
            result = VaR_ES_variance_covariance(
                portfolio, n_days, percentile, period)
            if result is None:
                return 'Failed to run because of invalid stock codes', 422
            VaR, expected_shortfall, data = result

            # convert data into json
            data['date'] = data.index
            data_json = json.loads(data.to_json(
                orient='records', date_format='iso'))
            return {'VaR': VaR, 'expected_shortfall': expected_shortfall, 'data': data_json}, 200
        if method == 'monte':
            time_step = request.json.get('time_step')
            num_simulations = request.json.get('num_simulations')
            use_weighted = request.json.get('use_weighted')
            if not (time_step and num_simulations):
                return 'Missing time step or num simulations input', 422
            result = VaR_ES_monte_carlo(
                portfolio, n_days, percentile, period, time_step, num_simulations, use_weighted)
            if result is None:
                return 'Failed to run because of invalid stock codes', 422
            VaR, expected_shortfall, simulations, sorted_sim = result

            # jsonify simulations array
            df = pd.DataFrame(simulations)
            df.columns = list(map(lambda x: 'simulation ' + str(x), df.columns))
            df.index = list(map(lambda x: x * time_step, df.index))
            sim_json = json.loads(df.to_json(orient='index'))

            # jsonify sorted simulations ending prices
            sorted_sim['Simulation'] = sorted_sim.index
            sorted_sim_json = json.loads(sorted_sim.to_json(orient='records'))

            return {'VaR': VaR, 'expected_shortfall': expected_shortfall, 'simulations': sim_json,
                    'ending_prices': sorted_sim_json}, 200

        return 'Invalid method. Choose from "historical", "covariance" or "monte"', 422

if __name__ == '__main__':
    app.run()

