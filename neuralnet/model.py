from dataset import ImageDataset

#https://towardsdatascience.com/understanding-pytorch-with-an-example-a-step-by-step-tutorial-81fc5f8c4e8e

class NNModel:
    def __init__(self, network, learning_rate):
        train_set = ImageDataset('data/2018-01-01-2019-01-01-20-False')

        self.train_loader = torch.utils.data.DataLoader(dataset=train_set, batch_size = 10, shuffle=False, drop_last=True)

        test_set = ImageDataset('data/2019-01-01-2020-01-01-20-False')

        self.test_loader = torch.utils.data.DataLoader(dataset=test_set, batch_size=10, shuffle=False, drop_last=True)

        self.learning_rate = learning_rate 

        self.model= network
        
        self.lossfn = nn.BCELoss()  

        #not sure for this 
        self.optimizer = optim.SGD(self.model.parameters(), lr=learning_rate, momentum=0.9)
    

    #https://www.analyticsvidhya.com/blog/2019/01/guide-pytorch-neural-networks-case-studies/
    def train_step(self):
        self.model.train()

        train_loss = []

        #train one batch 
        for images, labels in self.trainloader:

            #zero grads 
            self.optimizer.zero_grad()

            #forward propagation  
            output = self.model(images)

            #loss calculation 
            loss = self.lossfn(output, labels)

            #backward propagation 
            loss.backward()

            #weight optimization 
            self.optimizer.step()

            train_loss.append(loss.item())
        
        return train_loss 


    def train_epoch(self, n):
        for epoch in range(n):
            train_loss = self.train_step()
            print(train_loss)


    def eval_step(self):
        #eval mode for setting things like dropout ssh 
        self.model.eval()


