from pandas import Series
from matplotlib import pyplot
from statsmodels.tsa.arima_model import ARIMA
from statsmodels.tsa.arima_model import ARIMAResults
from sklearn.metrics import mean_squared_error
from math import sqrt
import numpy
import pandas as pd
import sys
# create a differenced series
def difference(dataset, interval=1):
	diff = list()
	for i in range(interval, len(dataset)):
		value = dataset[i] - dataset[i - interval]
		diff.append(value)
	return diff
 
# invert differenced value
def inverse_difference(history, yhat, interval=1):
	return yhat + history[-interval]
 
# load and prepare datasets
dataset = Series.from_csv('champagne.csv',header=0)
X = dataset.values.astype('float32')
history = [x for x in X]
months_in_year = 12
# load model
model_fit = ARIMAResults.load('Newmodel.pkl')
bias = numpy.load('Newmodel_bias.npy')
# make first prediction
predictions = list()
# rolling forecasts
month = int(sys.argv[1])
print(month)
for i in range(0, month):
	# difference data
	months_in_year = 12
	diff = difference(history, months_in_year)
	# predict
	model = ARIMA(diff, order=(0,0,1))
	model_fit = model.fit(trend='nc', disp=0)
	yhat = model_fit.forecast()[0]
	yhat = bias + inverse_difference(history, yhat, months_in_year)
	predictions.append(yhat[0])
	# observation
	
	history.append(yhat)
	
# report performance

print('predicted')


dates = pd.date_range('10/1/2018', periods=month ,freq='M')

output = {'Month': dates,
          'Sales': predictions
        }
print('appending')


data = pd.DataFrame(output, columns= ['Month', 'Sales'])

export_csv = data.to_csv (r'C:\Users\Pradeep\Desktop\Proj\d\export_dataframe.csv', index = None, header=True)

print('success')
sys.stdout.flush()
