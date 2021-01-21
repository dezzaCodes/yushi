import pandas as pd 
import numpy as np 
import get_stocks
import mplfinance as mpf 
from PIL import Image
from numpy import asarray
from pathlib import Path
import argparse 
from matplotlib import pyplot as plt
from datetime import datetime
import math 

'''
plots candlestick plot for one stock given appropriate dataframe 
v = boolean, whether to inc volume in charts
'''
def plot_stock_candle(df, v):
    try:
        #to get rid of axis and titles 
        rcparams = {'axes.spines.bottom':False,
            'axes.spines.left':False,
            'axes.spines.right':False,
            'axes.spines.top':False,
            'xtick.color':'none',
            'ytick.color':'none',
            'axes.labelcolor':'none'
            }
            
        #green/red style
        mc = mpf.make_marketcolors(base_mpf_style='charles',inherit=True)
        s = mpf.make_mpf_style(gridstyle='',rc=rcparams, marketcolors=mc, facecolor='black')
        #plot candlestick and export... not sure if there is better way than exporting 
        mpf.plot(df,type='candle', volume=v,style=s,savefig=dict(fname='candle.jpeg',dpi=100))
        plt.close()
    except TypeError:
        pass

def get_images(images_dict, v, dir_path):
    '''
    given dictionary with (code,dataframe) pairs, for each dataframe plots candlestick, crops edge, resizes 
    Then exports as jpeg file to appropriate folder
    '''
    for key, value in images_dict.items():
        
        #plot using function 
        plot_stock_candle(value, v)
        im = Image.open("candle.jpeg")

        #transform to np array (3d) 
        data = asarray(im)

        #delete white edge (for axes) from image as mplfinance doesnt have the option to remove axes (i think)
        #select black pixel and get coordinates 
        mask = np.all(data == (0, 0, 0), axis=-1)
        coords = np.argwhere(mask)
        #get bounding box coords
        x0, y0 = coords[0]
        x1,y1 = coords[-1] + 1
        #crop image 
        cropped = data[x0:x1, y0:y1]
        #convert back to image and resize. 
        im = Image.fromarray(cropped)
        #downsample to 50 x 50, making (50,50,3)
        im = im.resize((50,50),resample=0)
        
        #export for dataset 
        output_file = key+'.jpeg'
        output_dir = Path('data/'+dir_path+'/images')
        output_dir.mkdir(parents=True, exist_ok=True)
        im.save(output_dir/output_file)
    #plt.close()
    #return im_list


def get_labels(labels_dict, dir_path):
    '''
    given dictionary of (code,dataframe) pairs, where each dataframe holds data for one day 
    generates labels, defined as 
    1, where (open <= close) (up -> green)
    0, (where open > close) (down -> red)
    '''
    labels_d = {}
    for key,value in labels_dict.items():
        value.reset_index(drop=True, inplace=True)
        try: 
            if (value.loc[0,'Open'] > value.loc[0,'Close']):
                labels_d[key] = 0
            else: 
                labels_d[key] = 1
        except KeyError: 
            pass 
    labels = pd.DataFrame([labels_d])
    labels = labels.T 
    #output_file = 'labels'+intv_num+'.csv'
    output_file = 'labels.csv'
    output_dir = Path('data/'+dir_path+'/labels')
    output_dir.mkdir(parents=True, exist_ok=True)
    labels.to_csv(output_dir/output_file, header=None, mode='a')

def get_images_labels(stocks, start, end, interval2, v, dir_path, intv_num):
    '''
    given arguments from main, generates dictionary of (code, dataframe) pairs from get_stocks 
    then further passes appropriate data into get_images, get_labels for export 
    '''
    #dictionaries to pass into corresponding functions 
    all_stocks = get_stocks.get_all_stocks(stocks, start, end, interval2, str(intv_num))
    labels_dict = all_stocks.copy()
    images_dict = all_stocks.copy()
    #number of rows needed for image (arbitrary element)
    n = len(next(iter(all_stocks.values()))) - 1
    for key, value in all_stocks.items():
        
        #all but last row for images
        images_dict[key] = value.head(n)
        #only last row for labels 
        labels_dict[key] = value.tail(1)
    #dir_path = args['start']+'-'+args['end']+'-'+args['interval2']+'-'+str(args['volume'])
    get_images(images_dict, v, dir_path)
    get_labels(labels_dict, dir_path)

def date_range(start, end, diff):
    '''
    given starting date and ending date and number of days (strings)
    returns a list of dates between start and end, each separated by given no. of days 
    '''
    list_dates=[]
    diff = pd.Timedelta(diff+' days')
    start = datetime.strptime(start,"%Y-%m-%d")
    end = datetime.strptime(end,"%Y-%m-%d")
    intv = (end - start)/diff 
    intv = math.ceil(intv)
    for i in range(intv):
        list_dates.append((start + diff * i).strftime("%Y-%m-%d"))
    return list_dates


def main(args):
    dates_list = date_range(args['start'], args['end'], args['interval1'])
    print(dates_list)
    asx50 = pd.read_csv("asx50.csv")
    stocks = asx50['S&P/ASX 50 Index (1 March 2020)'].tolist()
    stocks.pop(0)
    dir_path = args['start']+'-'+args['end']+'-'+args['interval1']+'-'+str(args['volume'])
    for i in range(0,len(dates_list)-1):
        get_images_labels(stocks, dates_list[i], dates_list[i+1], args['interval2'], args['volume'], dir_path, i)

    #get_images_labels(args)
    

if __name__ == '__main__':
    ap = argparse.ArgumentParser()
    ap.add_argument('start',help="start date in YYYY-MM-dd string format (inclusive)", nargs='?', default="2020-01-01")
    ap.add_argument('end',help="end date in YYYY-MM-dd string format (exclusive)", nargs='?',default="2020-01-10")
    ap.add_argument('interval1', help="how many days on each chart (inc. last day for label) format is '[number] days'", nargs='?',default="10")
    ap.add_argument('interval2', help="fetches data from yfinance by interval: 1m,2m,5m,15m,30m,60m,90m,1h,1d,5d,1wk,1mo,3mo", nargs='?',default="1d")
    #ap.add_argument('num_stocks', help="number of stocks wanted (<=200) from ASX200", nargs='?',default="50", type=int)
    ap.add_argument('-v', '--volume', default=False, action='store_true', help="-v or --volume for volume to be included in candlestick charts. Default false.")
    args = vars(ap.parse_args())
    main(args)



#https://stackoverflow.com/questions/29721228/given-a-date-range-how-can-we-break-it-up-into-n-contiguous-sub-intervals
