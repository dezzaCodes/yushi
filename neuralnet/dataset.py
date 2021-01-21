import torch
from torch.utils import data
import pandas as pd 
import numpy as np 
from torchvision import transforms
from torch.utils.data.dataset import Dataset
from PIL import Image


#https://github.com/utkuozbulak/pytorch-custom-dataset-examples#custom-dataset-fundamentals

class ImageDataset(Dataset):
    def __init__(self, dir_path):
        #read in csv for labels 
        self.labels_info = pd.read_csv(dir_path+'/labels/labels.csv', header=None)

        #first column of labels is ID 
        self.img_names = np.asarray(self.labels_info.iloc[:,0])

        #second column is labels 
        self.labels= np.asarray(self.labels_info.iloc[:,1])

        self.dir_path = dir_path 

        #self.list_IDs = list_IDs
        self.transformations = transforms.Compose([transforms.ToTensor()])

    def __len__(self):
        return len(self.labels_info.index)

    def __getitem__(self, index):
        
        #get image file name 
        img_name = self.img_names[index]

        #open image 
        image = Image.open(self.dir_path+'/images/'+img_name+'.jpeg')

        #apply transform to tensor 
        image = self.transformations(image)

        #get label of image 
        label = self.labels[index]
        
        return (image,label)


#if __name__ == 'main':
#    im_dataset = ImageDataset('data/2018-01-01-2019-01-01-20-False/labels/labels.csv')