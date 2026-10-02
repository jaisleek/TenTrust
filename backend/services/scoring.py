from typing import Any, Dict, Optional


def affordability_points(rent: float, income: float) -> int:
    if rent <= 0 or income <= 0:
        raise ValueError("Monthly rent and income must be greater than zero.")
    ratio = rent / income
    if ratio <= 0.25:
        return 100
    if ratio <= 0.30:
        return 90
    if ratio <= 0.35:
        return 75
    if ratio <= 0.40:
        return 60
    if ratio <= 0.50:
        return 35
    return 10


def rental_history_points(on_time: int, total: int) -> Optional[int]:
    if total < 1:
        return None
    if on_time < 0 or on_time > total or total > 12:
        raise ValueError("Rental payment history must cover up to 12 payments.")
    ratio = on_time / total
    if ratio >= 0.95:
        return 100
    if ratio >= 0.90:
        return 85
    if ratio >= 0.80:
        return 70
    if ratio >= 0.70:
        return 50
    return 20


def calculate_readiness_score(
    monthly_rent: float,
    monthly_income: float,
    on_time_payments: Optional[int] = None,
    total_payments: Optional[int] = None,
    income_evidence: bool = False,
    rental_reference: bool = False,
) -> Dict[str, Any]:
    """Deterministic advisory score; verification outcomes never change this score."""
    affordability = affordability_points(monthly_rent, monthly_income)
    history = rental_history_points(on_time_payments or 0, total_payments or 0)
    evidence = (50 if income_evidence else 0) + (50 if rental_reference else 0)

    factors = [
        {"key": "affordability", "label": "Rent affordability", "weight": 0.50, "score": affordability},
        {"key": "evidence", "label": "Income and rental reference evidence", "weight": 0.20, "score": evidence},
    ]
    if history is not None:
        factors.append({"key": "rental_history", "label": "Rental payment history", "weight": 0.30, "score": history})

    weight_total = sum(factor["weight"] for factor in factors)
    score = round(sum(factor["weight"] * factor["score"] for factor in factors) / weight_total)
    evidence_coverage = (0.50 + (0.30 if history is not None else 0.0) + (0.20 if income_evidence or rental_reference else 0.0))
    confidence = "high" if evidence_coverage >= 0.8 else "moderate" if evidence_coverage >= 0.65 else "low"

    return {
        "score": max(1, min(100, score)),
        "scale": 100,
        "label": "Tenant readiness (advisory)",
        "confidence": confidence,
        "evidence_coverage": round(evidence_coverage * 100),
        "source": "rules-based",
        "factors": factors,
        "identity_status": "not_included_in_score",
        "disclaimer": "Advisory screening information only. Do not use as the sole basis for a tenancy decision.",
    }
