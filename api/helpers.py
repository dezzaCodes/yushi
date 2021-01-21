# Using Alpha Vantage API
# Alpha Vantage Key: 0EHIZWC8BUQPIT0U

from alpha_vantage.timeseries import TimeSeries
from datetime import datetime, timedelta
import random
import time
from bs4 import BeautifulSoup
import requests
import pandas as pd
from .models import Stock
import yfinance as yf

# for cycling between keys
class Keys:
    i = 0
    keys = ['0EHIZWC8BUQPIT0U', 'R2KSQ6LN7799K136', 'MSMSBCNSPZSLGB65']
    @staticmethod
    def fetchKey():
        key = Keys.keys[Keys.i]
        Keys.i = Keys.i + 1 if Keys.i + 1 < len(Keys.keys) else 0
        return key

# User Agent List
headers =[{'User-Agent': 'Mozilla/5.0'}]

# Time delays 
delays = [7, 4, 6, 2, 10, 19, 20, 1]


def fetchStockData(code):
    try:
        # Chose your output format, or default to JSON (python dict)
        ts = TimeSeries(Keys.fetchKey())
        data, meta = ts.get_quote_endpoint(symbol='ASX:'+code)
        # data from alpha_vantage
        open = data.get('02. open')
        high = data.get('03. high')
        low = data.get('04. low')
        price = data.get('05. price')
        volume = data.get('06. volume')
        latest_day = datetime.fromisoformat(data.get('07. latest trading day'))
        previous_close = data.get('08. previous close')
        change = data.get('09. change')
        change = float(change)
        change = str(round(change,2))
        change_percent = data.get('10. change percent')
        change_percent = change_percent.replace('%','')
        change_percent = float(change_percent)
        change_percent = str(round(change_percent,2))+'%'


        change_percent = change + " " + "("+change_percent+")"
 

        # data from scraper
        scraper = Scraper()

        profile_page = scraper.scrape_profile_page(code)
        home_page = scraper.scrape_home_page(code)

        if scraper.is_ETF(home_page) == True:
            ask_price = scraper.get_ask_price(home_page)
            bid_price = scraper.get_bid_price(home_page)
            name = scraper.get_EFT_name(profile_page)
            day_range = scraper.get_day_range(home_page)
            low_high_range = scraper.get_52_week_range(home_page)
            net_assets = scraper.get_market_cap(home_page)
            expense_ratio = scraper.get_ex_dividend_date(home_page)

            stock = Stock(code=code, latest_day=latest_day, open=open, high=high, low=low,
                          price=price, previous_close=previous_close, volume=volume, change=change, change_percent=change_percent,
                          ask_price=ask_price, bid_price=bid_price, company_name=name, day_range=day_range,
                          _52_week_range=low_high_range, market_cap=net_assets, ex_div_date=expense_ratio,
                          sector='Exchange Traded Fund',  PE_value='N/A', description='N/A', url='N/A')
        else:
            description = scraper.get_company_description(profile_page)
            sector, industry = scraper.get_company_sector(profile_page)
            url = scraper.get_company_url(profile_page)
            market_cap = scraper.get_market_cap(home_page)
            ask_price = scraper.get_ask_price(home_page)
            bid_price = scraper.get_bid_price(home_page)
            PE_value = scraper.get_PE_value(home_page)
            company_name = scraper.get_company_name(profile_page)
            low_high_range = scraper.get_52_week_range(home_page)
            day_range = scraper.get_day_range(home_page)
            ex_div_date = scraper.get_ex_dividend_date(home_page)

            stock = Stock(code=code, latest_day=latest_day, open=open, high=high, low=low,
                          price=price, previous_close=previous_close, volume=volume, change=change, change_percent=change_percent,
                          description=description, sector=sector, market_cap=market_cap, ask_price=ask_price,
                          bid_price=bid_price, PE_value=PE_value, company_name=company_name, url=url,
                          _52_week_range=low_high_range, day_range=day_range, ex_div_date=ex_div_date)


        return stock

    except Exception as err:
        print(err)
        return None


def fetchStockHistory(code, period='1y', start=None):
    try:
        test = yf.Ticker(code+'.AX')
        df = test.history(period=period, start=start)
        if (df.empty):
            start = start - timedelta(days=2)
            df = test.history(period=period, start=start)
            print (df)
        # reformating the dataframe column names
        df.columns = ['open', 'high', 'low', 'close',
                      'volume', 'dividends', 'stock_splits']
        df['date'] = df.index
        
        # remove any duplicate dates
        df = df.loc[~df.index.duplicated(keep='first')]
        return df
    except Exception as err:
        print(err)
    return None

#####################
#                   #
#   SCRAPER CLASS   #
#                   #
#####################

class Scraper:

    def __init__(self):
        pass

    def _clean_tag(self, tag):
        return tag.string.strip()

    def _parse_changes(self, tag, price_types):
        [change_percent, change] = [self._clean_tag(
            x) for x in tag.select(price_types)]
        # need to swap them around if wrong one holds %
        if (change_percent.find('%') == -1):
            tmp = change_percent
            change_percent = change
            change = tmp
        return change_percent, change

    def _parse_stock_details(self, tag, price_types):
        code = tag.find(class_='code')
        name = tag.find('a')
        price = tag.find(class_='right')
        change_percent, change = self._parse_changes(tag, price_types)
        return {
            'code': self._clean_tag(code),
            'name': self._clean_tag(name),
            'price': self._clean_tag(price),
            'change_percent': change_percent,
            'change': change
        }

    def _parse_sector_details(self, tag, price_types='.price-up,.price-down,.price-neutral'):
        sector = tag.find('td')
        price = sector.find_next_sibling()
        change_percent, change = self._parse_changes(tag, price_types)
        return {
            'sector': self._clean_tag(sector),
            'price': self._clean_tag(price),
            'change_percent': change_percent,
            'change': change
        }

    ##################
    # Market Details #
    ##################

    def get_top_gainers(self):
        res = requests.get('https://www.asx.com.au/asx/widget/topGains.do')
        soup = BeautifulSoup(res.content, 'lxml')
        return [self._parse_stock_details(tag=x, price_types='.price-up') for x in soup.select('#price_data_widget > #top5-data > tr')]

    def get_top_declines(self):
        res = requests.get(
            'https://data.asx.com.au/asx/widget/topDeclines.do')
        soup = BeautifulSoup(res.content, 'lxml')
        return [self._parse_stock_details(tag=x, price_types='.price-down') for x in soup.select('#price_data_widget > #top5-data > tr')]

    def get_top_companies(self):
        res = requests.get(
            'https://www.asx.com.au/asx/widget/topCompanies.do')
        soup = BeautifulSoup(res.content, 'lxml')
        return [self._parse_stock_details(tag=x, price_types='.price-up,.price-down,.price-neutral') for x in soup.select('#price_data_widget > #top50-data > tr')]

    def get_industry_indices(self):
        res = requests.get(
            'https://www.asx.com.au/asx/widget/industryIndices.do')
        soup = BeautifulSoup(res.content, 'lxml')
        return [self._parse_sector_details(tag=x, price_types='.price-up,.price-down,.price-neutral') for x in soup.select('#price_data_widget > #top50-data > tr')]

    #################
    # STOCK DETAILS #
    #################

    def scrape_profile_page(self, stock):
        header = random.choice(headers)
        res = requests.get(
            f'https://finance.yahoo.com/quote/{stock}.AX/profile', headers = header)
        soup = BeautifulSoup(res.content, 'lxml')

        return soup

    def scrape_home_page(self, stock):
        header = random.choice(headers)
        res = requests.get(
            f'https://finance.yahoo.com/quote/{stock}.AX')
        soup = BeautifulSoup(res.content, 'lxml')

        return soup
    
    def scrape_stats_page(self, stock):
        header = random.choice(headers)
        delay = random.choice(delays)
        time.sleep(delay)
        res = requests.get(
            f'https://finance.yahoo.com/quote/{stock}.AX/key-statistics')
        soup = BeautifulSoup(res.content, 'lxml')
        return soup

    def scrape_balance_sheet(self, stock):       
        header = random.choice(headers)
        delay = random.choice(delays)
        time.sleep(delay)
        res = requests.get( 
            f'https://au.finance.yahoo.com/quote/{stock}.AX/balance-sheet', headers = header)
        soup = BeautifulSoup(res.content, 'lxml')
        return soup
    
    def scrape_income_statement(self, stock):
        header = random.choice(headers)
        res = requests.get(f'https://au.finance.yahoo.com/quote/{stock}.AX/financials', headers = header)
        soup = BeautifulSoup(res.content, 'lxml')
        delay = random.choice(delays)
        time.sleep(delay)
        return soup

    # Return true if exchange traded fund
    def is_ETF(self, home_soup):
        determinant = home_soup.find_all(
            'td', {'class': 'C($primaryColor) W(51%)'})
        determinant = determinant[8].text
        if (determinant == 'Net Assets'):
            return True
        return False

    def get_Price(self, home_soup):
        price = home_soup.find_all('div', {'class': 'My(6px) Pos(r) smartphone_Mt(6px)'})
        price = price[0].find('span', {'class':'Trsdu(0.3s) Trsdu(0.3s) Fw(b) Fz(36px) Mb(-4px) D(b)'})
        price = float(price.text)
        return price

    def get_Change(self, home_soup):
        try:
            change = home_soup.find_all('div', {'class': 'My(6px) Pos(r) smartphone_Mt(6px)'})
            change = change[0].find_all('div', {'class':'D(ib) Va(t)'})
            change = change[0].text.split(")")
            change = change[0] + ")"
        except:
            change = None
        return change
            
    def get_company_description(self, profile_soup):
        try:
            soup = profile_soup
            description = soup.find('p', {'class': 'Mt(15px) Lh(1.6)'}).text
        except:
            description = None
        
        return description

    def get_company_sector(self, profile_soup):
        try:
            company = profile_soup.find_all('span', {'class': 'Fw(600)'})
            sector = company[0].text
            industry = company[1].text
        except:
            sector = None
            industry = None

        return sector, industry

    def get_company_board(self, profile_soup):
        try:
            board = {}
            execs = profile_soup.find_all('td', {'class': 'Ta(start)'})
            value = None
            for i, x in enumerate(execs):
                if (i % 2 == 0):
                    value = x.text
                else:
                    board[x.text] = value
        except:
            board = None

        return board

    def get_company_url(self, profile_soup):
        try:
            url = profile_soup.find_all('a', attrs={'rel': 'noopener noreferrer'})
            url = url[0].text
        except:
            url = None

        return url

    def get_Open(self, home_soup):
        open_price = home_soup.find_all('td', {'class': 'Ta(end) Fw(600) Lh(14px)'})
        open_price = float(open_price[1].text)

        return open_price
    
    def get_Prev_Close(self, home_soup):
        prev_close = home_soup.find_all('td', {'class': 'Ta(end) Fw(600) Lh(14px)'})

        return float(prev_close[0].text)

    def get_Volume(self, home_soup):
        volume = home_soup.find_all('td', {'class': 'Ta(end) Fw(600) Lh(14px)'})

        return int(volume[6].text.replace(",",""))
    
    def get_market_cap(self, home_soup):
        market_cap = home_soup.find_all('td', {'class': 'Ta(end) Fw(600) Lh(14px)'})

        return market_cap[8].text

    def get_dividend_yield(self, stats_page):
        table = stats_page.find_all('td', {'class': 'Fw(500) Ta(end) Pstart(10px) Miw(60px)'})
        div_yield = table[28].text

        return div_yield

    def get_ask_price(self, home_soup):
        ask_value = home_soup.find_all('td', {'class': 'Ta(end) Fw(600) Lh(14px)'})

        return ask_value[3].text

    def get_PE_value(self, home_soup):
        PE_ratio = home_soup.find_all('td', {'class': 'Ta(end) Fw(600) Lh(14px)'})

        return PE_ratio[10].text

    def get_bid_price(self, home_soup):
        bid_value = home_soup.find_all('td', {'class': 'Ta(end) Fw(600) Lh(14px)'})

        return bid_value[2].text

    def get_company_name(self, profile_soup):
        try:
            name = profile_soup.find_all('h3', {'class': 'Fz(m) Mb(10px)'})
            name = name[0].text
        except:
            name = None
        
        return name

    def get_52_week_range(self, home_soup):
        market_cap = home_soup.find_all('td', {'class': 'Ta(end) Fw(600) Lh(14px)'})

        return market_cap[5].text

    def get_day_range(self, home_soup):
        market_cap = home_soup.find_all('td', {'class': 'Ta(end) Fw(600) Lh(14px)'})

        return market_cap[4].text
    
    def get_EPS(self, home_soup):
        EPS = home_soup.find_all('td', {'class': 'Ta(end) Fw(600) Lh(14px)'})

        return EPS[11].text
        

    def get_ex_dividend_date(self, home_soup):
        ex_div_date = home_soup.find_all(
            'td', {'class': 'Ta(end) Fw(600) Lh(14px)'})

        return ex_div_date[14].text
    
    def get_EFT_name(self,profile_soup):
        try:
            name = profile_soup.find_all('span', {'class': 'Fl(end)'})
            name = name[1].text
        except:
            name = None
        
        return name

    def get_all_companies(self):
        file_name = 'http://www.asx.com.au/programs/ISIN.xls'
        df = pd.read_excel(file_name)
        condition = df['ASX code'].str.len() == 3
        df = df[condition][['ASX code', 'Company name']]
        return df.to_json(orient='values')
