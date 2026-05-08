from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional

from app.services.trading.paper_trading import paper_trading_engine
from app.services.market.data_engine import market_data_engine

router = APIRouter(prefix="/trading", tags=["trading"])


class OrderRequest(BaseModel):
    symbol: str
    side: str  # buy | sell
    quantity: int
    order_type: str = "stock"  # stock | call | put
    price: Optional[float] = None
    contract_symbol: Optional[str] = None
    strike: Optional[float] = None
    expiration: Optional[str] = None
    strategy: Optional[str] = None


@router.post("/order")
async def execute_order(request: OrderRequest):
    """Execute a paper trading order."""
    sym = request.symbol.upper()
    quote = await market_data_engine.get_quote(sym)

    price = request.price or quote.price

    result = paper_trading_engine.execute_order(
        symbol=sym,
        side=request.side,
        quantity=request.quantity,
        price=price,
        order_type=request.order_type,
        contract_symbol=request.contract_symbol,
        strike=request.strike,
        expiration=request.expiration,
        strategy=request.strategy,
    )

    if not result["success"]:
        raise HTTPException(status_code=400, detail=result["error"])

    return result


@router.get("/portfolio")
async def get_portfolio():
    """Get current portfolio summary."""
    # Update prices
    quotes = await market_data_engine.get_all_quotes(
        list(set([p["symbol"] for p in paper_trading_engine.positions.values()]))
    )
    paper_trading_engine.update_prices({sym: q.price for sym, q in quotes.items()})
    return paper_trading_engine.get_portfolio_summary()


@router.get("/positions")
async def get_positions():
    """Get open positions."""
    paper_trading_engine.update_positions()
    return {"positions": list(paper_trading_engine.positions.values())}


@router.get("/history")
async def get_trade_history(limit: int = 50):
    """Get trade history."""
    return {"trades": paper_trading_engine.get_trade_history(limit)}


@router.delete("/position/{position_id}")
async def close_position(position_id: str):
    """Close a position."""
    pos = next(
        (p for p in paper_trading_engine.positions.values() if p["id"] == position_id),
        None
    )
    if not pos:
        raise HTTPException(status_code=404, detail="Position not found")

    quote = await market_data_engine.get_quote(pos["symbol"])
    result = paper_trading_engine.execute_order(
        symbol=pos["symbol"],
        side="sell",
        quantity=pos["quantity"],
        price=quote.price,
        order_type=pos["type"],
        contract_symbol=pos.get("contract_symbol"),
    )
    return result
