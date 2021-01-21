import numpy as np 
import torch 
import torch.nn as tnn
import torch.nn.functional as F
from torch import nn, optim


class CNN(nn.Module):
    
    
    def __init__(self):
        super().__init__()
        self.conv1 = nn.Sequential(
            nn.Conv2d(3,8, kernel_size = 3), 
            #nn.BatchNorm2d(10),
            nn.MaxPool2d(kernel_size = 2),
            nn.ReLU() 
        )
        self.conv2 = nn.Sequential(
            nn.Conv2d(8, 16, kernel_size = 3),
            #nn.BatchNorm2d(50),
            nn.MaxPool2d(kernel_size = 2),
            nn.ReLU()
        )
        self.conv3 = nn.Sequential(
            nn.Conv2d(16, 32, kernel_size = 3), #stride = 1
            #nn.BatchNorm2d(50),
            nn.MaxPool2d(kernel_size = 2), 
            nn.ReLU()
        )
         
        self.conv4 = nn.Sequential(
            nn.Conv2d(32, 64, kernel_size = 3), #stride = 1
            #nn.BatchNorm2d(50),
            nn.MaxPool2d(kernel_size = 2), 
            nn.ReLU()
        )

        self.fc = nn.Linear(64, 1)
        self.sigmoid = nn.Sigmoid()
        self.dropout = nn.Dropout(p=0.2, inplace=False)

    def forward(self, x):
        x = self.conv1(x)
        
        x = self.conv2(x)

        x = self.dropout(self.conv3(x))
        x = self.conv4(x)
        

        x = x.reshape(x.size(0), -1)

        x = self.dropout(self.fc(x))

        x = self.sigmoid(x)

        x = x.view(-1)
        return x