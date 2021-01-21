import pandas as pd 
import numpy as np 
from sklearn import preprocessing 
from sklearn.model_selection import train_test_split
import get_stocks
import mplfinance as mpf 
from PIL import Image
from numpy import asarray
from pathlib import Path



#https://arxiv.org/pdf/1903.12258.pdf

class ChartData():

    def __init__(self, volume):
        self.all_stocks = get_stocks.get_all_stocks("2020-03-07", "2020-03-17", "1d")
        self.volume = volume

    '''
    plots candlestick plot for one stock given appropriate dataframe 
    volume = boolean, whether to inc volume in charts
    '''
    def plot_stock_candle(self, df):

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
        mpf.plot(df,type='candle', volume=self.volume,style=s,savefig=dict(fname='candle.jpeg',dpi=100))
    

    '''
    given list of dataframes, for each dataframe plots candlestick 
    then transforms for neural network. Exports to data file 
    '''
    def get_images(self, images_dict):
        #im_list = []
        for key, value in images_dict.items():
            
            #plot using function 
            self.plot_stock_candle(value)
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

            #downsample to 100 x 100, making (100,100,3)
            im = im.resize((100,100),resample=0)

            
            #export for dataset 
            output_file = key+'.png'
            output_dir = Path('data/images')

            output_dir.mkdir(parents=True, exist_ok=True)

            im.save(output_dir/output_file)
        #return im_list
    

    '''
    returns output of each train/test set. 
    list of labels (0 or 1) where 0 is stock decrease, 1 is increase 
    '''
    @staticmethod
    def get_labels(labels_dict):
        #up = 1, where open <= close (green)
        #down = 0, where open > close (red)
        labels_d = {}
        for key,value in labels_dict.items():
            value.reset_index(drop=True, inplace=True)
            if (value.loc[0,'Open'] > value.loc[0,'Close']):
                labels_d[key] = 0
            else: 
                labels_d[key] = 1
        labels = pd.DataFrame([labels_d])
        labels = labels.T 


        output_file = 'labels.csv'
        output_dir = Path('data/labels')

        output_dir.mkdir(parents=True, exist_ok=True)

        labels.to_csv(output_dir/output_file, header=None)

    '''
    given all_stocks list of dfs (each representing one company)
    returns tuple 
    first is list of images (candlestick chart, each is 3d tensor)
    second is corresponding list of labels (either 1 or 0)
    '''
    def get_images_labels(self):
        #dictionaries to pass into corresponding functions 
        labels_dict = self.all_stocks.copy()
        images_dict = self.all_stocks.copy()

        #number of rows needed for image (arbitrary element)
        n = len(next(iter(self.all_stocks.values()))) - 1

        for key, value in self.all_stocks.items():
            
            #all but last row for images
            images_dict[key] = value.head(n)

            #only last row for labels 
            labels_dict[key] = value.tail(1)

        self.get_images(images_dict)
        self.get_labels(labels_dict)


    '''
    splits all data into training and test sets, with proportion given (between 0 and 1)
    '''
    def generate_testtrain(self, test_size):
        im_list, labels = self.get_images_labels()
        #randomly split into training/test data sets (70% train, 30% test)
        X_train, X_test, y_train, y_test = train_test_split(
        im_list, labels, test_size=test_size)

        return (X_train,X_test,y_train,y_test)
