import torchvision 
import torch 
import pandas as pd
import mplfinance as mpf 
from PIL import Image
from matplotlib import pyplot as plt
import yfinance as yf
yf.pdr_override()
import argparse
from numpy import asarray 
import numpy as np
from torchvision import transforms
import os 
from .cnn import CNN 
import matplotlib

def get_stock(code):
        
    '''
    returns dataframe of ONE stock
    '''
    #download from yfinance
    df = yf.download(code+".AX", period="1mo", interval="1d")
    

    return df.tail(20)


def plot_stock_candle(df):
    matplotlib.use('Agg')
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
        mpf.plot(df,type='candle', volume=False,style=s,savefig=dict(fname='candle.jpeg',dpi=100))
        plt.close()
    except TypeError:
        pass

def get_images(df, key):

    
    #plot using function 
    plot_stock_candle(df)

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
        
    #export 
    output_file = key+'.jpeg'
    im.save(output_file)

def generate_image(code):
    #generate dataset first 
    #need to make sure last 20 STOCK DAYS
    df = get_stock(code)
    get_images(df, code)




#performs transform on image (preprocessing)
def transform_image(code):
    img = Image.open(code+'.jpeg')
    transformations = transforms.Compose([transforms.ToTensor(), transforms.Normalize((0.5,), (0.5,))])
    return transformations(img)
    


def get_prediction(code):
    #model = torch.load('model.pth')
    model = CNN()
    # t = torch.load('api/model.pth')
    model.load_state_dict(torch.load('api/90.pth'))
    model.eval()
    #print(model)
    try:
        generate_image(code)
        img_tensor = transform_image(code)
        img_tensor = img_tensor[None, :, :, :]
        output = model.forward(img_tensor)
    
        if output >= 0.5: 
            pred = 1
        if output < 0.5: 
            pred = 0
            output = 1-output
        output = output*100
        os.remove('candle.jpeg')
        os.remove(code+'.jpeg')
        return (float(output), pred)
    except:
        pass


'''
def main(args):
    output,pred = get_prediction(args['code'])
    print(float(output))
    print(pred)
    

    #get_images_labels(args)
    

if __name__ == '__main__':
    ap = argparse.ArgumentParser()
    ap.add_argument('code',help="code", nargs='?', default='CBA')
    args = vars(ap.parse_args())
    main(args)
'''




