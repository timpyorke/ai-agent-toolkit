# Examples

## Component Patterns

### Compound Components (Tabs)

```tsx
const TabsContext = React.createContext<{
  active: string;
  setActive: (id: string) => void;
} | null>(null);

function Tabs({ children }: { children: React.ReactNode }) {
  const [active, setActive] = useState("");
  return (
    <TabsContext.Provider value={{ active, setActive }}>
      <div role="tablist">{children}</div>
    </TabsContext.Provider>
  );
}

function Tab({ id, children }: { id: string; children: React.ReactNode }) {
  const ctx = React.useContext(TabsContext)!;
  return (
    <button
      role="tab"
      aria-selected={ctx.active === id}
      onClick={() => ctx.setActive(id)}
    >
      {children}
    </button>
  );
}
```

## Custom Hooks

### Data Fetching Hook

```tsx
function useUser(userId: string) {
  const [data, setData] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    fetch(`/api/users/${userId}`)
      .then(r => r.json())
      .then(d => active && setData(d))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [userId]);

  return { data, loading };
}
```

### TanStack Query (Better Approach)

```tsx
import { useQuery } from "@tanstack/react-query";

function useUserQuery(id: string) {
  return useQuery({
    queryKey: ["user", id],
    queryFn: async () => (await fetch(`/api/users/${id}`)).json(),
    staleTime: 60_000,
  });
}
```

## Performance Optimization

### React.memo & useMemo

```tsx
const ExpensiveList = React.memo(({ items }) => {
  return <ul>{items.map(i => <li key={i.id}>{i.name}</li>)}</ul>;
});

function Parent({ data }) {
  const filtered = useMemo(() => 
    data.filter(i => i.active), 
    [data]
  );
  return <ExpensiveList items={filtered} />;
}
```

### Code Splitting (Lazy)

```tsx
const UserProfile = React.lazy(() => import("./UserProfile"));

function App() {
  return (
    <Suspense fallback={<Spinner />}>
      <UserProfile />
    </Suspense>
  );
}
```
