from datetime import datetime
from bs4 import BeautifulSoup
import requests
import pandas as pd
from .models import Brief_Stock
from .helpers import Scraper
import yfinance as yf

# Get ASX300 information and save to database to be used in the stock screener 

class screenerHelper():
    def __init__(self):
        self._ticker_code = []

    @property
    def ticker_code(self):
        return self._ticker_code

    # Get all tickers that are in the ASX300 index
    def get_tickers(self):
        hdr = {'User-Agent': 'Mozilla/5.0'}

        res = requests.get('https://www.asx300list.com/', headers = {'User-Agent': 'Mozilla/5.0'})
        soup = BeautifulSoup(res.content, 'lxml')

        table = soup.find('table')
        codes = table.find_all('td')
        
        i = 0
        while i < len(codes):
            if(i % 5 == 0):
                self.ticker_code.append(codes[i].text)
            i += 1
        
        return self.ticker_code
        
    # Save data of each stock in the ASX300 into the database
    def save_data(self, code):
        scraper = Scraper()
        
        balance_sheet = scraper.scrape_balance_sheet(code)
        income_statement = scraper.scrape_income_statement(code)

        try:
            ticker = yf.Ticker(code +'.AX')
            stock_info = ticker.info

            # info from yfinance
            code = code
            
            # market cap
            market_cap = (stock_info['marketCap'])
            string_market_cap = self.string_cap(market_cap)

            # PE Ratio
            price_earning_ratio = stock_info['trailingPE']
            
            # EPS
            earning_per_share = stock_info['trailingEps']
            
            # Dividend yield
            dividend_yield = stock_info['dividendYield']
            
            # Sector
            sector = stock_info['sector']
            
            # ROE
            ROE = self.calculate_ROE(balance_sheet, income_statement)
            
            stock = Brief_Stock(code = code, market_cap = market_cap, PE_value = price_earning_ratio, 
                    EPS = earning_per_share, div_yield = dividend_yield, sector = sector, 
                    string_market_cap = string_market_cap, ROE = ROE)

        except:
            print(f"error with {code} occured")
            # set up web scraper
            home_page = scraper.scrape_home_page(code)
            profile_page = scraper.scrape_profile_page(code)
            stats_page = scraper.scrape_stats_page(code)
            balance_sheet = scraper.scrape_balance_sheet(code)

            # code
            code = code

            # market cap
            try:
                market_cap = scraper.get_market_cap(home_page)
                market_cap = self.num_converter(market_cap)
                string_market_cap = self.string_cap(market_cap)
            except:
                market_cap = None

            # Earnings per share
            try:
                EPS = scraper.get_EPS(home_page)
                if (EPS == 'N/A'):
                    earning_per_share = None
                else:
                    earning_per_share = float(EPS)
            except:
                earning_per_share = None

            # PE ratio
            try:
                PE_ratio = scraper.get_PE_value(home_page)
                if(PE_ratio == 'N/A'):  # calculate P/E
                    PE_ratio = self.calc_PE_ratio(home_page, earning_per_share)
                else:
                    PE_ratio = float(PE_ratio.replace(',',''))
            except:
                PE_ratio = None

            # Dividend yield
            try:          
                temp = scraper.get_dividend_yield(stats_page)
                if (temp == 'N/A'):
                    dividend_yield = None
                else:
                    dividend_yield = float(temp.strip('%'))/100
            except:
                dividend_yield = None

            # Sector
            try:
                sector, industry = scraper.get_company_sector(profile_page)
            except:
                sector = None

            # ROE
            try:
                ROE = self.calculate_ROE(balance_sheet, income_statement)
            except:
                ROE = None
            
            # Save to stock object
            stock = Brief_Stock(code = code, market_cap = market_cap, PE_value = PE_ratio, 
                    EPS = earning_per_share, div_yield = dividend_yield, sector = sector, 
                    string_market_cap = string_market_cap, ROE = ROE)

        return stock

    #####################
    # UTILITY FUNCTIONS #
    #####################
    
    def num_converter(self, num):
        if ('B' in num):
            num = num.strip('B')
            rNum = float(num)
            rNum = int(rNum * 1000000000)
        elif ('M' in num):
            num = num.strip('M')
            rNum = float(num)
            rNum = int(rNum * 1000000)

        return rNum

    def calc_PE_ratio(self, home_page, EPS):
        table = home_page.find('div', {'class': 'My(6px) Pos(r) smartphone_Mt(6px)'})
        price = float(table.find('span').text)

        if (EPS == 0):
            PE = None
        elif (EPS is None):
            PE = None
        else:
            PE = price/EPS

        return PE

    def string_cap (self, market_cap):
        if (market_cap >= 10000000000):
            string_market_cap = "large"
        elif (market_cap >= 2000000000 and market_cap < 10000000000):
            string_market_cap = "medium"
        elif (market_cap < 2000000000):
            string_market_cap = "small"

        return string_market_cap

    def get_shareholder_equity(self, balance_sheet):
        try:
            index = balance_sheet.find_all('div', 
                {'class': 'Ta(c) Py(6px) Bxz(bb) BdB Bdc($seperatorColor) Miw(120px) Miw(140px)--pnclg D(tbc)'})  
            shareholder_equity = index[78].text
            shareholder_equity = float(shareholder_equity.replace(',',''))
        except:
            try:
                index = balance_sheet.find_all('div', 
                    {'class': 'Ta(c) Py(6px) Bxz(bb) BdB Bdc($seperatorColor) Miw(120px) Miw(140px)--pnclg D(tbc)'})
                shareholder_equity = index[60].text
                shareholder_equity = float(shareholder_equity.replace(',',''))
            except:
                try:
                    index = balance_sheet.find_all('div', 
                        {'class': 'Ta(c) Py(6px) Bxz(bb) BdB Bdc($seperatorColor) Miw(120px) Miw(140px)--pnclg D(tbc)'})
                    shareholder_equity = index[18].text
                    shareholder_equity = float(shareholder_equity.replace(',',''))
                except:    
                    shareholder_equity = None
        
        return shareholder_equity

    def get_net_income(self, income_statement):
        try: 
            index = income_statement.find_all('div', 
                {'class':'Ta(c) Py(6px) Bxz(bb) BdB Bdc($seperatorColor) Miw(120px) Miw(140px)--pnclg Bgc($lv1BgColor) fi-row:h_Bgc($hoverBgColor) D(tbc)'})
            net_income = index[36].text
            net_income = float(net_income.replace(',',''))
        except:
            try:
                index = income_statement.find_all('div', 
                    {'class':'Ta(c) Py(6px) Bxz(bb) BdB Bdc($seperatorColor) Miw(120px) Miw(140px)--pnclg Bgc($lv1BgColor) fi-row:h_Bgc($hoverBgColor) D(tbc)'})
                net_income = index[18].text
                net_income = float(net_income.replace(',',''))
            except:
                net_income = None
        
        return net_income

    def calculate_ROE(self, balance_sheet, income_statement):
        shareholder_equity = self.get_shareholder_equity(balance_sheet)
        net_income = self.get_net_income(income_statement)

        if (shareholder_equity == None or net_income == None):
           
            ROE = None
        else:
            ROE = net_income/shareholder_equity

        return ROE