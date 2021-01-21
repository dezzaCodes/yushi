import numpy as np 
import pandas as pd 
from pandas_datareader import data as pdr 
import random 
import yfinance as yf
yf.pdr_override()


def get_stock(code, start, end, interval):
        
    '''
    returns dataframe of ONE stock
    '''
    #download from yfinance
    df = yf.download(code, start=start, end=end, interval=interval)

    return df 

  


def get_all_stocks(stocks, start, end, interval, intv_num):
    '''
    given list of stocks, start, end date, interval
    returns dictionary of dataframes of all ASX200 stocks
    if num_stocks less than 200, selects randomly 
    '''
    #didn't use tickers because it returned multiindex 

    #use dictionary for stock as ID corresponding to each df
    stocks_dict = {}

    #pull stock codes from ASX200
    #asx200 = pd.read_csv("asx200.csv")
    #stocks = asx200['S&P/ASX 200 Index (1 March 2020)'].tolist()
    #stocks.pop(0)

    #select random stocks equal to num_stocks 
    #if (num_stocks < 200):
    #    stocks = random.sample(stocks, k=num_stocks)
    
    for i in range(0,len(stocks)):
        stocks_dict[stocks[i]+intv_num] = get_stock(stocks[i]+".AX", start, end, interval)


    #return all_stocks  
    return stocks_dict 


