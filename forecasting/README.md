To run forecasting service:

build dockerfile with docker running in background
> docker build -t budget-forecast .

run locally
> docker run -p 8090:8080 budget-forecast