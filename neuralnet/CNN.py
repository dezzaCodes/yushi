import torch
from torchvision import datasets, transforms
from torch import nn, optim
import torch.nn.functional as F
import matplotlib.pyplot as plt
import numpy as np
import preprocessing 


#change this later lmao
class CNN(nn.Module):
    def __init__(self):
        super().__init__()
        self.conv1 = nn.Sequential(
            nn.Conv2d(1,10, kernel_size = 5, stride = 1), 
            nn.ReLU(), 
            nn.MaxPool2d(kernel_size = 2)
        )
        self.conv2 = nn.Sequential(
            nn.Conv2d(10, 50, kernel_size = 5, stride = 1),
            nn.ReLU(), 
            nn.MaxPool2d(kernel_size = 2)
        )
        self.fc1 = nn.Linear(800, 256)
        self.fc2 = nn.Linear(256, 10)

    def forward(self, x):
        x = self.conv1(x)
        x = self.conv2(x)
        x = x.reshape(x.size(0), -1)
        x = self.fc1(x)
        x = F.relu(x)
        x = self.fc2(x)
        x = F.log_softmax(x, dim=1)
        return x


class NNModel:
    def __init__(self, network, learning_rate):
        self.model = network 
        #loss funnction 
        self.lossfn = nn.NLLLoss()  
        self.learning_rate = learning_rate 

    def train_step(self):
        self.model.train()
    
    def eval(self):
        self.model.eval()


    