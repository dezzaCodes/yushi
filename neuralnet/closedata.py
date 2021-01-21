import get_stock
import pandas as pd 
import numpy as np 
from sklearn import preprocessing 
from sklearn.model_selection import train_test_split
import get_stock

#https://medium.com/analytics-vidhya/predicting-stock-price-with-a-feature-fusion-gru-cnn-neural-network-in-pytorch-1220e1231911

class CloseData():

    def __init__(self):
        self.labels = []
        self.input_x = []
        self.X_train = [] 
        self.X_test = []
        self.Y_train = [] 
        self.Y_test =[]
        self.all_stocks = get_stocks.get_all_stocks_close()
        
    '''
    normalizes uses min-max normalization. Assumes dataframe passed in is from get_stock.all_stock
    '''
    @staticmethod 
    def normalize_data(df):

        #drop date col
        df.drop(columns=['Date'], inplace=True)

        #min-max using sklearn 
        x = df.values #returns a numpy array
        min_max_scaler = preprocessing.MinMaxScaler()
        x_scaled = min_max_scaler.fit_transform(x)
        df = pd.DataFrame(x_scaled)

        return df


    ''' 
    generates array of labels (outputs)
    '''
    @staticmethod 
    def get_labels(df):
        last = (len(all_stocks_n.columns)-1)
        for i in range(0,len(all_stocks_n.index)):
            labels.append(all_stocks_n.iloc[i, last])
    

    '''
    generates 2d array of inputs 
    '''
    @staticmethod 
    def get_input(df):
        df = df.iloc[:, :-1]
        input_x = df.values

 
    '''
    splits all data into training and test sets, with proportion given 
    '''
    def generate_testtrain(test_size):
        df = normalize_data(all_stocks)
        get_labels(df)
        get_input(df)
        
        #randomly split into training/test data sets (70% train, 30% test)
        X_train, X_test, y_train, y_test = train_test_split(
        input_x, labels, test_size=test_size)


if __name__ == "__main__":
    main()
