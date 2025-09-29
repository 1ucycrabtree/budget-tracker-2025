from fastapi import FastAPI
from pydantic import BaseModel
from typing import List
import pandas as pd
from prophet import Prophet

app = FastAPI(title="Budget Forecasting Service")


class HistoryPoint(BaseModel):
    date: str  # YYYY-MM-DD
    amount: float


class ForecastRequest(BaseModel):
    userId: str
    category: str
    history: List[HistoryPoint]
    months_ahead: int = 3  # number of months to forecast


class ForecastResponse(BaseModel):
    dates: List[str]
    predictions: List[float]


def prepare_monthly_data(history: List[HistoryPoint]) -> pd.DataFrame:
    """
    Aggregate individual transactions into monthly sums.
    Returns a DataFrame with 'ds' (month-end date) and 'y' (monthly total).
    """
    df = pd.DataFrame([{"ds": h.date, "y": h.amount} for h in history])
    df['ds'] = pd.to_datetime(df['ds'])
    df = df.resample('M', on='ds').sum().reset_index()
    return df


def forecast_monthly(history: List[HistoryPoint], months_ahead: int) -> ForecastResponse:
    if not history:
        today = pd.Timestamp.today().normalize()
        future_dates = pd.date_range(
            start=today, periods=months_ahead, freq='ME')
        return ForecastResponse(
            dates=future_dates.strftime('%Y-%m-%d').tolist(),
            predictions=[0]*months_ahead
        )

    # aggregate amounts per month
    df = prepare_monthly_data(history)

    # enable yearly seasonality only if >12 months of data
    if len(df) >= 12:
        yearly = True
    else:
        yearly = False

    model = Prophet(
        yearly_seasonality=yearly,
        weekly_seasonality=False,
        daily_seasonality=False,
        growth='linear'
    )
    model.fit(df)

    # future monthly periods starting from next month
    last_date = pd.Timestamp.today().normalize()
    future_dates = pd.date_range(
        start=last_date, periods=months_ahead, freq='ME')
    future_df = pd.DataFrame({"ds": future_dates})

    forecast = model.predict(future_df)

    preds = [max(0, y) for y in forecast['yhat'].tolist()]
    dates = forecast['ds'].dt.strftime('%Y-%m-%d').tolist()

    return ForecastResponse(dates=dates, predictions=preds)


@app.post("/forecast/monthly", response_model=ForecastResponse)
def monthly_forecast(req: ForecastRequest):
    return forecast_monthly(req.history, req.months_ahead)
