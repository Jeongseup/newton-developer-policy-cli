# Stable KRW Policy
# --------------------------------

package stablekrw_demo

# By default, deny requests.
default allow := false

# From Policy Data
currency_status := data.data.currency
captital_amount_status := data.data.thstrm_amount

# Allow the action if the `to` address is not sanctioned
allow if {
  data.params.currency == currency_status
  data.params.minimum_capital_requirements < captital_amount_status
}