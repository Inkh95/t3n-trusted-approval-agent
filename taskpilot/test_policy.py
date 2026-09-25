import json

from agent import classify_action


def parse(result):
    return json.loads(result)


def test_low_risk_preparation_stays_autonomous():
    result = parse(classify_action("organize meeting notes", "create a checklist"))
    assert result["risk"] == "low"
    assert result["requires_approval"] is False


def test_external_message_requires_review():
    result = parse(classify_action("follow up with supplier", "send email summary"))
    assert result["risk"] == "medium"
    assert result["requires_approval"] is True


def test_financial_action_requires_approval():
    result = parse(classify_action("renew subscription", "pay invoice"))
    assert result["risk"] == "high"
    assert result["requires_approval"] is True
