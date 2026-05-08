from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    # App
    APP_NAME: str = "QTrading API"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True
    HOST: str = "0.0.0.0"
    PORT: int = 8000

    # CORS
    ALLOWED_ORIGINS: list[str] = ["http://localhost:3000", "http://127.0.0.1:3000"]

    # Database
    DATABASE_URL: str = "postgresql+asyncpg://qtrading:qtrading@localhost:5432/qtrading"

    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"

    # API Keys
    OPENAI_API_KEY: Optional[str] = None
    POLYGON_API_KEY: Optional[str] = None
    ALPACA_API_KEY: Optional[str] = None
    ALPACA_SECRET_KEY: Optional[str] = None
    FINNHUB_API_KEY: Optional[str] = None

    # Data
    DATA_SOURCE: str = "yfinance"  # yfinance | polygon | alpaca | finnhub
    REFRESH_INTERVAL_SEC: float = 1.5

    # Trading
    PAPER_TRADING_INITIAL_BALANCE: float = 50_000.0
    RISK_PER_TRADE_PCT: float = 0.02  # 2% risk per trade

    # WebSocket
    WS_HEARTBEAT_INTERVAL: int = 30

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()
