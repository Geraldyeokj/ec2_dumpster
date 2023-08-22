import pandas as pd
from prophet import Prophet
import matplotlib.pyplot as plt
import numpy as np
import time
from prophet.plot import plot_plotly, plot_components_plotly
from sklearn.metrics import r2_score
from datetime import datetime
import scipy


df = pd.read_csv('test_input.csv')
actual_time_buffer = df["ds"]
# Will fail if df longer than 2.5 days ish

yraw = df["y"]
fs = 142  # sampling rate, Hz
sos = scipy.signal.iirfilter(4, Wn=[0.1, 2.5], fs=fs, btype="bandpass",
                             ftype="butter", output="sos")
yfilt = scipy.signal.sosfilt(sos, yraw)
# find peaks in smoothed signal
peaks, props = scipy.signal.find_peaks(yfilt, distance=0.35*fs, height=0.0)
# find peaks in noisy signal using wavelet decomposition
cwt_peaks = scipy.signal.find_peaks_cwt(yraw, widths=np.arange(5, 15))

print("peaks", peaks)
print("cwt_peaks", cwt_peaks)


# need to add functionality for when there is a gap in info
# maybe if gap in time then add datetime_ref in intervals
datetime_ref = pd.read_csv('datetime_day_ref.csv')

# will fail if df_time interval larger than gap
df_time_interval = df["ds"][len(df) - 1] - df["ds"][0] // (60 * 1000)
print(df_time_interval)

base = df["ds"][0]
for i in range(0, len(df)):
    #df["ds"][i] = pd.to_datetime(datetime_ref["ds"][(df["ds"][i] // (60 * 1000)) - base], unit='s')
    df["ds"][i] =  datetime.fromtimestamp(datetime_ref["ds"][(df["ds"][i] - base) // (60 * 1000)]).strftime("%Y-%m-%d")
    #df["ds"][i] = pd.to_datetime(df["ds"][i], format='%Y-%m-%d')
    
df['ds'] = pd.to_datetime(df['ds'])

# find diff in peaks
total_diff = 0
for i in range(1, len(peaks)):
    day_diff = (df["ds"][peaks[i]] - df["ds"][peaks[i - 1]]) / np.timedelta64(1, 'D')
    print("day diff:", day_diff, df["ds"][peaks[i]], df["ds"][peaks[i - 1]])
    total_diff += day_diff
estimated_period = int(round(total_diff / (len(peaks) - 1)))

print("ESTIMATED PERIOD:", estimated_period)

print(df.head())
print(df.tail())

max_r2 = -1
max_period = -1
max_merged = -1
merged_dict = {}
max_forecast = -1

previous_period = 350
with open('p_current.txt') as f:
    previous_period = int(f.read())
    print("previous_period", previous_period)

for p in range(estimated_period - 100, estimated_period + 100, 10):
    print(f"Testing period {p}")
    m = Prophet(weekly_seasonality = False, yearly_seasonality = False).add_seasonality(name='gassy', period=p, fourier_order = 10, prior_scale=0.1)
    m.fit(df)
    future = m.make_future_dataframe(periods=700)
    future.tail()
    forecast = m.predict(future)
    forecast[['ds', 'yhat', 'yhat_lower', 'yhat_upper']].tail()
    merged = forecast.merge(df, on="ds", how = 'outer')
    r2_merged = forecast.merge(df, on="ds", how = 'inner')
    r2 = r2_score(r2_merged["y"], r2_merged["yhat"])
    print("r2 score", r2, "max_r2", max_r2)
    if r2 > max_r2:
        max_r2 = r2
        max_period = p
        max_merged = merged
        max_forecast = forecast


# Python
print("plotting forecast")
fig1 = m.plot(max_forecast)
print(max_forecast.head())
print(max_forecast.tail())

now_ind = len(actual_time_buffer)
now_date = max_merged["ds"][now_ind - 1]
for i in range(0, len(max_merged)):
    max_merged["ds"][i] = (max_merged["ds"][i] - now_date) / np.timedelta64(1, 'D')

print(max_merged.head())
print(max_merged.tail())
"""
# now ind shoule be len() since it is not considered in actual time buffer
now_ind = len(actual_time_buffer)
now_date = max_merged["ds"][now_ind]
for i in range(now_ind, len(max_merged)):
    max_merged["ds"][i] = (max_merged["ds"][i] - df["ds"][peaks[i - 1]]) / np.timedelta64(1, 'D')
"""

"""
max_merged["ds"] = actual_time_buffer
"""
max_merged.to_csv("yhat_current.csv", index=False)
"""
print(max_merged.head())
print(max_merged.tail())
"""

text_file = open("p_current.txt", "w")
n = text_file.write(str(max_period))
text_file.close()

#max_merged.set_index(max_merged["ds"])

plt.figure(figsize=(15,7))
plt.suptitle(f"ETH Gas Prices Over Time (period {max_period}, r2 = {round(max_r2, 2)})", fontsize=17)
plt.xlabel('Time / Minutes')
plt.ylabel('Gas Price / Gwei')
plt.plot(max_merged["ds"], max_merged["y"], color='#D22A0D', label='Actual')
plt.plot(max_merged["ds"], max_merged["yhat"], color='#379BDB', label='Predicted')

plt.legend(loc='best')
plt.savefig('yhat_graph_current.png')
#plt.show()