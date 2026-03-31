# useCoinsCategoriesList

**Type**: hook

Get coins categories list (simple)

Fetches a simplified list of all available coin categories without market data.
This endpoint is optimized for dropdown menus, filters, and other UI components
that need category names and IDs but don't require market information. The data
is cached for 24 hours as category lists are relatively stable.

## Import

```typescript
import { useCoinsCategoriesList } from "@/neynar-web-sdk/coingecko";
```

## Hook Signature

```typescript
function useCoinsCategoriesList(
  options?: ExtendedQueryOptions<CategoryListItem[]> & CoinGeckoHookOptions,
): UseQueryResult | UseMutationResult;
```

## Parameters

### options

- **Type**: `ExtendedQueryOptions<CategoryListItem[]> & CoinGeckoHookOptions`
- **Required**: No
- **Description**: - Additional query options for caching and request behavior

## Returns

```typescript
UseQueryResult | UseMutationResult;
```

TanStack Query result containing simple category list data

## Usage

```typescript
import { useCoinsCategoriesList } from '@/neynar-web-sdk/coingecko';

function MyComponent() {
  const result = useCoinsCategoriesList([]);

  if (result.isLoading) return <div>Loading...</div>;
  if (result.error) return <div>Error: {result.error.message}</div>;

  return <div>{JSON.stringify(result.data)}</div>;
}
```

## Examples

### Example 1

Category selector dropdown

```tsx
function CategorySelector({
  onSelect,
}: {
  onSelect: (categoryId: string) => void;
}) {
  const { data: categories, isLoading } = useCoinsCategoriesList();

  if (isLoading)
    return (
      <select disabled>
        <option>Loading...</option>
      </select>
    );

  return (
    <select onChange={(e) => onSelect(e.target.value)} defaultValue="">
      <option value="">All Categories</option>
      {categories?.map((category) => (
        <option key={category.category_id} value={category.category_id}>
          {category.name}
        </option>
      ))}
    </select>
  );
}
```

### Example 2

Category filter chips

```tsx
function CategoryFilters({
  selectedCategories,
  onToggle,
}: {
  selectedCategories: string[];
  onToggle: (categoryId: string) => void;
}) {
  const { data: categories } = useCoinsCategoriesList();

  return (
    <div className="filter-chips">
      {categories?.map((category) => (
        <button
          key={category.category_id}
          className={`chip ${selectedCategories.includes(category.category_id) ? "active" : ""}`}
          onClick={() => onToggle(category.category_id)}
        >
          {category.name}
        </button>
      ))}
    </div>
  );
}
```

### Example 3

Searchable category list

```tsx
function SearchableCategories() {
  const { data: categories } = useCoinsCategoriesList();
  const [search, setSearch] = useState("");

  const filteredCategories = categories?.filter((category) =>
    category.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div>
      <input
        type="text"
        placeholder="Search categories..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <ul>
        {filteredCategories?.map((category) => (
          <li key={category.category_id}>{category.name}</li>
        ))}
      </ul>
    </div>
  );
}
```
