# useCompaniesPublicTreasury

**Type**: hook

Fetches public treasury holdings data for companies holding Bitcoin or Ethereum

This hook provides comprehensive data about companies that hold cryptocurrency in their
public treasuries, including total holdings, current values, and market dominance metrics.
Data is cached for 1 hour and optimized for performance with proper error handling.

## Import

```typescript
import { useCompaniesPublicTreasury } from "@/neynar-web-sdk/coingecko";
```

## Hook Signature

```typescript
function useCompaniesPublicTreasury(
  coinId: string,
  options?: ExtendedQueryOptions<CompaniesPublicTreasuryResponse> &
    CoinGeckoHookOptions,
): UseQueryResult | UseMutationResult;
```

## Parameters

### coinId

- **Type**: `string`
- **Required**: Yes
- **Description**: - The cryptocurrency to query ("bitcoin" or "ethereum")

### options

- **Type**: `ExtendedQueryOptions<CompaniesPublicTreasuryResponse> &
CoinGeckoHookOptions`
- **Required**: No
- **Description**: - Optional query configuration parameters

## Returns

```typescript
UseQueryResult | UseMutationResult;
```

UseQueryResult containing:

- `data.companies`: Array of company holdings with financial details
- `data.total_holdings`: Combined cryptocurrency holdings across all companies
- `data.total_value_usd`: Total USD value of all company holdings
- `data.market_cap_dominance`: Percentage of total supply held by companies

## Usage

```typescript
import { useCompaniesPublicTreasury } from '@/neynar-web-sdk/coingecko';

function MyComponent() {
  const result = useCompaniesPublicTreasury("example", /* value */);

  if (result.isLoading) return <div>Loading...</div>;
  if (result.error) return <div>Error: {result.error.message}</div>;

  return <div>{JSON.stringify(result.data)}</div>;
}
```

## Examples

```tsx
function CompanyHoldings() {
  const { data, isLoading, error } = useCompaniesPublicTreasury("bitcoin");

  if (isLoading) return <div>Loading company data...</div>;
  if (error) return <div>Error: {error.message}</div>;

  const companies = data?.companies || [];
  const totalValue = data?.total_value_usd || 0;

  return (
    <div>
      <h2>Total Value: ${totalValue.toLocaleString()}</h2>
      {companies.map((company) => (
        <div key={company.name}>
          {company.name}: {company.total_holdings} BTC
        </div>
      ))}
    </div>
  );
}
```
