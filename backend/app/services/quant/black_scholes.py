"""
Black-Scholes options pricing model with full Greeks calculations.
"""
import math
from typing import Literal
from scipy.stats import norm
import numpy as np


def _d1(S: float, K: float, T: float, r: float, sigma: float) -> float:
    """Calculate d1 component of Black-Scholes formula."""
    if T <= 0 or sigma <= 0:
        return float("inf") if S >= K else float("-inf")
    return (math.log(S / K) + (r + 0.5 * sigma**2) * T) / (sigma * math.sqrt(T))


def _d2(d1_val: float, sigma: float, T: float) -> float:
    """Calculate d2 component."""
    return d1_val - sigma * math.sqrt(T)


def black_scholes_price(
    S: float,        # Underlying price
    K: float,        # Strike price
    T: float,        # Time to expiration (years)
    r: float,        # Risk-free rate
    sigma: float,    # Implied volatility
    option_type: Literal["call", "put"] = "call",
) -> float:
    """Calculate Black-Scholes option price."""
    if T <= 0:
        if option_type == "call":
            return max(0.0, S - K)
        return max(0.0, K - S)

    d1 = _d1(S, K, T, r, sigma)
    d2 = _d2(d1, sigma, T)

    if option_type == "call":
        price = S * norm.cdf(d1) - K * math.exp(-r * T) * norm.cdf(d2)
    else:
        price = K * math.exp(-r * T) * norm.cdf(-d2) - S * norm.cdf(-d1)

    return max(0.0, round(price, 4))


def calculate_greeks(
    S: float,
    K: float,
    T: float,
    r: float,
    sigma: float,
    option_type: Literal["call", "put"] = "call",
) -> dict:
    """Calculate all option Greeks."""
    if T <= 0:
        return {"delta": 1.0 if (option_type == "call" and S > K) else 0.0,
                "gamma": 0.0, "theta": 0.0, "vega": 0.0, "rho": 0.0}

    d1 = _d1(S, K, T, r, sigma)
    d2 = _d2(d1, sigma, T)
    sqrt_T = math.sqrt(T)
    nd1 = norm.pdf(d1)

    # Delta
    if option_type == "call":
        delta = norm.cdf(d1)
    else:
        delta = norm.cdf(d1) - 1

    # Gamma (same for calls and puts)
    gamma = nd1 / (S * sigma * sqrt_T)

    # Theta (per day)
    theta_common = -(S * nd1 * sigma) / (2 * sqrt_T)
    if option_type == "call":
        theta = (theta_common - r * K * math.exp(-r * T) * norm.cdf(d2)) / 365
    else:
        theta = (theta_common + r * K * math.exp(-r * T) * norm.cdf(-d2)) / 365

    # Vega (per 1% change in IV)
    vega = S * nd1 * sqrt_T / 100

    # Rho (per 1% change in rate)
    if option_type == "call":
        rho = K * T * math.exp(-r * T) * norm.cdf(d2) / 100
    else:
        rho = -K * T * math.exp(-r * T) * norm.cdf(-d2) / 100

    return {
        "delta": round(delta, 4),
        "gamma": round(gamma, 4),
        "theta": round(theta, 4),
        "vega": round(vega, 4),
        "rho": round(rho, 4),
    }


def implied_volatility(
    market_price: float,
    S: float,
    K: float,
    T: float,
    r: float,
    option_type: Literal["call", "put"] = "call",
    max_iterations: int = 100,
    tolerance: float = 1e-5,
) -> float:
    """Calculate implied volatility using Newton-Raphson method."""
    if T <= 0 or market_price <= 0:
        return 0.0

    intrinsic = max(0, S - K) if option_type == "call" else max(0, K - S)
    if market_price < intrinsic:
        return 0.0

    # Initial guess using Brenner-Subrahmanyam approximation
    sigma = math.sqrt(2 * math.pi / T) * market_price / S

    for _ in range(max_iterations):
        price = black_scholes_price(S, K, T, r, sigma, option_type)
        d1 = _d1(S, K, T, r, sigma)
        vega = S * norm.pdf(d1) * math.sqrt(T)

        if abs(vega) < 1e-10:
            break

        price_diff = price - market_price
        if abs(price_diff) < tolerance:
            break

        sigma = sigma - price_diff / vega
        sigma = max(0.001, min(sigma, 10.0))  # Bounds

    return round(sigma, 4)


def calculate_option_chain(
    symbol: str,
    S: float,
    strikes: list[float],
    expirations: list[str],  # ISO date strings
    r: float = 0.05,
    base_iv: float = 0.25,
) -> list[dict]:
    """Calculate full options chain with Black-Scholes pricing."""
    import datetime
    today = datetime.date.today()
    contracts = []

    for exp_str in expirations:
        exp_date = datetime.date.fromisoformat(exp_str)
        T = max(0, (exp_date - today).days) / 365.0

        for K in strikes:
            moneyness = abs(math.log(S / K))
            # IV smile: higher IV for OTM options
            iv = base_iv + moneyness * 0.3 + 0.05 * math.sqrt(T)
            iv = max(0.05, min(iv, 3.0))

            for opt_type in ("call", "put"):
                price = black_scholes_price(S, K, T, r, iv, opt_type)
                greeks = calculate_greeks(S, K, T, r, iv, opt_type)

                intrinsic = max(0, S - K) if opt_type == "call" else max(0, K - S)
                extrinsic = max(0, price - intrinsic)
                dte = max(0, (exp_date - today).days)

                spread = price * 0.03 + 0.05
                contracts.append({
                    "contract_symbol": f"{symbol}{exp_str.replace('-','')}{'C' if opt_type == 'call' else 'P'}{int(K*1000):08d}",
                    "strike": K,
                    "expiration": exp_str,
                    "type": opt_type,
                    "bid": round(max(0.01, price - spread/2), 2),
                    "ask": round(price + spread/2, 2),
                    "last": round(price, 2),
                    "change": round((price - price * (1 + 0.05 * (S/S - 1))), 2),
                    "change_percent": round((0.05 * (S/S - 1)) * 100, 2),
                    "volume": int(abs(1000 * math.exp(-moneyness * 5))),
                    "open_interest": int(abs(5000 * math.exp(-moneyness * 3))),
                    "implied_volatility": round(iv, 4),
                    "intrinsic_value": round(intrinsic, 2),
                    "extrinsic_value": round(extrinsic, 2),
                    "in_the_money": (S > K if opt_type == "call" else S < K),
                    "days_to_expiration": dte,
                    **greeks,
                })

    return contracts
