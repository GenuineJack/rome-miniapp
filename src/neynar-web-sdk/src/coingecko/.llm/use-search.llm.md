# useSearch

**Type**: hook

Performs comprehensive search across coins, exchanges, categories, and NFTs

This hook provides real-time search functionality across all CoinGecko data types
with built-in validation, debouncing recommendations, and comprehensive error handling.

## Import

```typescript
import { useSearch } from "@/neynar-web-sdk/coingecko";
```

## Hook Signature

```typescript
function useSearch(
  query: string,
  options?: ExtendedQueryOptions<SearchResponse> & CoinGeckoHookOptions,
): QueryHookResult<SearchResponse>;
```

## Parameters

### query

- **Type**: `string`
- **Required**: Yes
- **Description**: - Search term to query across all CoinGecko data types (minimum 2 characters)

### options

- **Type**: `ExtendedQueryOptions<SearchResponse> & CoinGeckoHookOptions`
- **Required**: No
- **Description**: - Additional TanStack Query options for customizing behavior

## Returns

```typescript
QueryHookResult<SearchResponse>;
```

UseQueryResult containing search results with coins, exchanges, categories, and NFTs

## Usage

```typescript
import { useSearch } from '@/neynar-web-sdk/coingecko';

function MyComponent() {
  const result = useSearch("example", /* value */);

  if (result.isLoading) return <div>Loading...</div>;
  if (result.error) return <div>Error: {result.error.message}</div>;

  return <div>{JSON.stringify(result.data)}</div>;
}
```

## Examples

### Example 1

Basic search with validation

```typescript
function CryptoSearch() {
  const [searchTerm, setSearchTerm] = useState("");
  const {
    data: searchResults,
    isLoading,
    error,
    isError,
  } = useSearch(searchTerm, {
    enabled: searchTerm.length >= 2, // Only search when query is long enough
    staleTime: 10 * 60 * 1000, // Cache results for 10 minutes
  });

  if (isLoading) return React.createElement("div", null, "Searching...");
  if (isError)
    return React.createElement("div", null, `Search failed: ${error?.message}`);

  return React.createElement("div", null, [
    React.createElement("input", {
      key: "search-input",
      value: searchTerm,
      onChange: (e) => setSearchTerm(e.target.value),
      placeholder: "Search coins, exchanges, NFTs...",
      className: "w-full p-3 border rounded-lg",
    }),
    searchResults?.coins &&
      searchResults.coins.length > 0 &&
      React.createElement("section", { key: "coins" }, [
        React.createElement(
          "h3",
          { key: "title" },
          `Coins (${searchResults.coins.length})`,
        ),
        ...searchResults.coins.map((coin) =>
          React.createElement(
            "div",
            {
              key: coin.id,
              className: "flex items-center gap-3 p-2",
            },
            [
              coin.thumb &&
                React.createElement("img", {
                  src: coin.thumb,
                  alt: coin.name,
                  className: "w-6 h-6",
                }),
              React.createElement(
                "span",
                null,
                `${coin.name} (${coin.symbol?.toUpperCase()})`,
              ),
              coin.market_cap_rank &&
                React.createElement(
                  "span",
                  null,
                  `Rank #${coin.market_cap_rank}`,
                ),
            ],
          ),
        ),
      ]),
  ]);
}
```

### Example 2

Search with debouncing and advanced filtering

```typescript
import { useMemo } from "react";
import { useDebounce } from "@/hooks/useDebounce";

function AdvancedCryptoSearch() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<"all" | "coins" | "exchanges">(
    "all",
  );

  // Debounce search input to avoid excessive API calls
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const {
    data: searchResults,
    isLoading,
    error,
  } = useSearch(debouncedSearchTerm, {
    enabled: debouncedSearchTerm.length >= 2,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  // Filter results based on user selection
  const filteredResults = useMemo(() => {
    if (!searchResults) return null;

    switch (filterType) {
      case "coins":
        return { ...searchResults, exchanges: [], categories: [], nfts: [] };
      case "exchanges":
        return { ...searchResults, coins: [], categories: [], nfts: [] };
      default:
        return searchResults;
    }
  }, [searchResults, filterType]);

  const totalResults = filteredResults
    ? filteredResults.coins.length +
      filteredResults.exchanges.length +
      filteredResults.categories.length +
      filteredResults.nfts.length
    : 0;

  return {
    searchInput: React.createElement("input", {
      value: searchTerm,
      onChange: (e) => setSearchTerm(e.target.value),
      placeholder: "Search crypto data...",
      className: "flex-1 p-3 border rounded-lg",
    }),
    filterSelect: React.createElement("select", {
      value: filterType,
      onChange: (e) => setFilterType(e.target.value as any),
      className: "p-3 border rounded-lg",
    }),
    isLoading,
    error,
    totalResults,
    filteredResults,
  };
}
```
