export type Difficulty = "easy" | "medium" | "hard";

export interface CodeSnippet {
  id: string;
  title: string;
  language: string;
  difficulty: Difficulty;
  text: string;
  personalBestWPM: number | null;
}

export const defaultCodeSnippets: CodeSnippet[] = [
  // ═══════════════════════════════════════
  //  JavaScript
  // ═══════════════════════════════════════
  {
    id: "js-easy",
    title: "Variables & Loops",
    language: "JavaScript",
    difficulty: "easy",
    text: `let count = 0;
for (let i = 0; i < 10; i++) {
  count += i;
}
console.log(count);`,
    personalBestWPM: null,
  },
  {
    id: "js-med",
    title: "Array Methods",
    language: "JavaScript",
    difficulty: "medium",
    text: `function processUsers(users) {
  const active = users.filter(u => u.isActive);
  const names = active.map(u => u.name);
  const sorted = names.sort((a, b) => a.localeCompare(b));
  return sorted.join(", ");
}`,
    personalBestWPM: null,
  },
  {
    id: "js-hard",
    title: "Async Iterator",
    language: "JavaScript",
    difficulty: "hard",
    text: `async function* paginate(url) {
  let page = 1;
  while (true) {
    const res = await fetch(\`\${url}?page=\${page}\`);
    const data = await res.json();
    if (data.items.length === 0) return;
    yield* data.items;
    page++;
  }
}

for await (const item of paginate("/api/users")) {
  console.log(item.name);
}`,
    personalBestWPM: null,
  },

  // ═══════════════════════════════════════
  //  TypeScript
  // ═══════════════════════════════════════
  {
    id: "ts-easy",
    title: "Type Aliases",
    language: "TypeScript",
    difficulty: "easy",
    text: `type User = {
  name: string;
  age: number;
  active: boolean;
};

const user: User = {
  name: "Alice",
  age: 30,
  active: true,
};`,
    personalBestWPM: null,
  },
  {
    id: "ts-med",
    title: "Generic Interface",
    language: "TypeScript",
    difficulty: "medium",
    text: `interface ApiResponse<T> {
  data: T;
  status: number;
  message: string;
}

async function fetchData<T>(url: string): Promise<ApiResponse<T>> {
  const res = await fetch(url);
  const json = await res.json();
  return { data: json, status: res.status, message: "ok" };
}`,
    personalBestWPM: null,
  },
  {
    id: "ts-hard",
    title: "Mapped & Conditional Types",
    language: "TypeScript",
    difficulty: "hard",
    text: `type DeepReadonly<T> = {
  readonly [K in keyof T]: T[K] extends object
    ? DeepReadonly<T[K]>
    : T[K];
};

type EventMap = {
  click: { x: number; y: number };
  keydown: { key: string; code: number };
};

function on<K extends keyof EventMap>(
  event: K,
  handler: (payload: EventMap[K]) => void
): void {
  window.addEventListener(event, handler as EventListener);
}`,
    personalBestWPM: null,
  },

  // ═══════════════════════════════════════
  //  Python
  // ═══════════════════════════════════════
  {
    id: "py-easy",
    title: "Functions & Lists",
    language: "Python",
    difficulty: "easy",
    text: `def greet(name):
    return f"Hello, {name}!"

names = ["Alice", "Bob", "Charlie"]
for name in names:
    print(greet(name))`,
    personalBestWPM: null,
  },
  {
    id: "py-med",
    title: "List Comprehension",
    language: "Python",
    difficulty: "medium",
    text: `def fibonacci(n):
    a, b = 0, 1
    result = []
    while a < n:
        result.append(a)
        a, b = b, a + b
    return result

squares = [x ** 2 for x in range(10) if x % 2 == 0]`,
    personalBestWPM: null,
  },
  {
    id: "py-hard",
    title: "Decorator & Context Manager",
    language: "Python",
    difficulty: "hard",
    text: `import functools
import time
from contextlib import contextmanager

def timer(func):
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        start = time.perf_counter()
        result = func(*args, **kwargs)
        elapsed = time.perf_counter() - start
        print(f"{func.__name__} took {elapsed:.4f}s")
        return result
    return wrapper

@contextmanager
def managed_resource(name):
    print(f"Acquiring {name}")
    try:
        yield name
    finally:
        print(f"Releasing {name}")`,
    personalBestWPM: null,
  },

  // ═══════════════════════════════════════
  //  Swift
  // ═══════════════════════════════════════
  {
    id: "swift-easy",
    title: "Optionals & Guard",
    language: "Swift",
    difficulty: "easy",
    text: `func greet(_ name: String?) -> String {
    guard let name = name else {
        return "Hello, stranger!"
    }
    return "Hello, \\(name)!"
}

let message = greet("Alice")
print(message)`,
    personalBestWPM: null,
  },
  {
    id: "swift-med",
    title: "Enum & Switch",
    language: "Swift",
    difficulty: "medium",
    text: `enum Direction {
    case north, south, east, west
}

func describe(_ dir: Direction) -> String {
    switch dir {
    case .north: return "Going up"
    case .south: return "Going down"
    case .east: return "Going right"
    case .west: return "Going left"
    }
}`,
    personalBestWPM: null,
  },
  {
    id: "swift-hard",
    title: "Protocol & Associated Types",
    language: "Swift",
    difficulty: "hard",
    text: `protocol Container {
    associatedtype Item: Equatable
    var count: Int { get }
    mutating func append(_ item: Item)
    subscript(i: Int) -> Item { get }
}

struct Stack<Element: Equatable>: Container {
    private var items: [Element] = []
    var count: Int { items.count }

    mutating func append(_ item: Element) {
        items.append(item)
    }

    subscript(i: Int) -> Element {
        return items[i]
    }

    mutating func pop() -> Element? {
        return items.popLast()
    }
}`,
    personalBestWPM: null,
  },

  // ═══════════════════════════════════════
  //  C
  // ═══════════════════════════════════════
  {
    id: "c-easy",
    title: "Arrays & Pointers",
    language: "C",
    difficulty: "easy",
    text: `int sum(int* arr, int len) {
    int total = 0;
    for (int i = 0; i < len; i++) {
        total += arr[i];
    }
    return total;
}`,
    personalBestWPM: null,
  },
  {
    id: "c-med",
    title: "Linked List",
    language: "C",
    difficulty: "medium",
    text: `struct Node {
    int data;
    struct Node* next;
};

struct Node* insert(struct Node* head, int val) {
    struct Node* node = malloc(sizeof(struct Node));
    node->data = val;
    node->next = head;
    return node;
}`,
    personalBestWPM: null,
  },
  {
    id: "c-hard",
    title: "Hash Table",
    language: "C",
    difficulty: "hard",
    text: `#define TABLE_SIZE 256

typedef struct Entry {
    char* key;
    int value;
    struct Entry* next;
} Entry;

typedef struct {
    Entry* buckets[TABLE_SIZE];
} HashMap;

unsigned int hash(const char* key) {
    unsigned int h = 0;
    while (*key) {
        h = h * 31 + (unsigned char)(*key++);
    }
    return h % TABLE_SIZE;
}

void put(HashMap* map, const char* key, int value) {
    unsigned int idx = hash(key);
    Entry* e = malloc(sizeof(Entry));
    e->key = strdup(key);
    e->value = value;
    e->next = map->buckets[idx];
    map->buckets[idx] = e;
}`,
    personalBestWPM: null,
  },

  // ═══════════════════════════════════════
  //  C++
  // ═══════════════════════════════════════
  {
    id: "cpp-easy",
    title: "Vectors & Loops",
    language: "C++",
    difficulty: "easy",
    text: `#include <vector>
#include <iostream>

int main() {
    std::vector<int> nums = {1, 2, 3, 4, 5};
    int sum = 0;
    for (int n : nums) {
        sum += n;
    }
    std::cout << "Sum: " << sum << std::endl;
    return 0;
}`,
    personalBestWPM: null,
  },
  {
    id: "cpp-med",
    title: "Template Class",
    language: "C++",
    difficulty: "medium",
    text: `template <typename T>
class Stack {
    std::vector<T> data;
public:
    void push(const T& val) {
        data.push_back(val);
    }
    T pop() {
        T top = data.back();
        data.pop_back();
        return top;
    }
    bool empty() const { return data.empty(); }
};`,
    personalBestWPM: null,
  },
  {
    id: "cpp-hard",
    title: "Move Semantics & RAII",
    language: "C++",
    difficulty: "hard",
    text: `template <typename T>
class UniquePtr {
    T* ptr;
public:
    explicit UniquePtr(T* p = nullptr) : ptr(p) {}
    ~UniquePtr() { delete ptr; }

    UniquePtr(const UniquePtr&) = delete;
    UniquePtr& operator=(const UniquePtr&) = delete;

    UniquePtr(UniquePtr&& other) noexcept : ptr(other.ptr) {
        other.ptr = nullptr;
    }

    UniquePtr& operator=(UniquePtr&& other) noexcept {
        if (this != &other) {
            delete ptr;
            ptr = other.ptr;
            other.ptr = nullptr;
        }
        return *this;
    }

    T& operator*() const { return *ptr; }
    T* operator->() const { return ptr; }
};`,
    personalBestWPM: null,
  },

  // ═══════════════════════════════════════
  //  Rust
  // ═══════════════════════════════════════
  {
    id: "rust-easy",
    title: "Structs & Methods",
    language: "Rust",
    difficulty: "easy",
    text: `struct Rectangle {
    width: f64,
    height: f64,
}

impl Rectangle {
    fn area(&self) -> f64 {
        self.width * self.height
    }

    fn is_square(&self) -> bool {
        self.width == self.height
    }
}`,
    personalBestWPM: null,
  },
  {
    id: "rust-med",
    title: "Ownership & Match",
    language: "Rust",
    difficulty: "medium",
    text: `fn longest<'a>(x: &'a str, y: &'a str) -> &'a str {
    if x.len() > y.len() { x } else { y }
}

fn describe(val: Option<i32>) -> String {
    match val {
        Some(n) if n > 0 => format!("positive: {}", n),
        Some(n) => format!("non-positive: {}", n),
        None => String::from("nothing"),
    }
}`,
    personalBestWPM: null,
  },
  {
    id: "rust-hard",
    title: "Trait Objects & Generics",
    language: "Rust",
    difficulty: "hard",
    text: `use std::collections::HashMap;

trait Summary {
    fn summarize(&self) -> String;
    fn author(&self) -> &str;
}

struct Article {
    title: String,
    author: String,
    content: String,
}

impl Summary for Article {
    fn summarize(&self) -> String {
        format!("{} by {}: {}...", self.title, self.author, &self.content[..50])
    }
    fn author(&self) -> &str { &self.author }
}

fn notify(items: &[&dyn Summary]) -> HashMap<String, Vec<String>> {
    let mut by_author: HashMap<String, Vec<String>> = HashMap::new();
    for item in items {
        by_author
            .entry(item.author().to_string())
            .or_default()
            .push(item.summarize());
    }
    by_author
}`,
    personalBestWPM: null,
  },

  // ═══════════════════════════════════════
  //  Go
  // ═══════════════════════════════════════
  {
    id: "go-easy",
    title: "Structs & Methods",
    language: "Go",
    difficulty: "easy",
    text: `type Point struct {
    X, Y float64
}

func (p Point) Distance(q Point) float64 {
    dx := p.X - q.X
    dy := p.Y - q.Y
    return math.Sqrt(dx*dx + dy*dy)
}`,
    personalBestWPM: null,
  },
  {
    id: "go-med",
    title: "HTTP Handler",
    language: "Go",
    difficulty: "medium",
    text: `func handleUsers(w http.ResponseWriter, r *http.Request) {
    if r.Method != http.MethodGet {
        http.Error(w, "method not allowed", 405)
        return
    }
    users, err := db.GetAllUsers()
    if err != nil {
        http.Error(w, err.Error(), 500)
        return
    }
    json.NewEncoder(w).Encode(users)
}`,
    personalBestWPM: null,
  },
  {
    id: "go-hard",
    title: "Concurrency & Channels",
    language: "Go",
    difficulty: "hard",
    text: `func fanOut(input <-chan int, workers int) <-chan int {
    out := make(chan int)
    var wg sync.WaitGroup
    for i := 0; i < workers; i++ {
        wg.Add(1)
        go func() {
            defer wg.Done()
            for val := range input {
                result := heavyCompute(val)
                out <- result
            }
        }()
    }
    go func() {
        wg.Wait()
        close(out)
    }()
    return out
}`,
    personalBestWPM: null,
  },

  // ═══════════════════════════════════════
  //  Java
  // ═══════════════════════════════════════
  {
    id: "java-easy",
    title: "Class & Constructor",
    language: "Java",
    difficulty: "easy",
    text: `public class Person {
    private String name;
    private int age;

    public Person(String name, int age) {
        this.name = name;
        this.age = age;
    }

    public String toString() {
        return name + " (" + age + ")";
    }
}`,
    personalBestWPM: null,
  },
  {
    id: "java-med",
    title: "Stream API",
    language: "Java",
    difficulty: "medium",
    text: `public List<String> getActiveEmails(List<User> users) {
    return users.stream()
        .filter(User::isActive)
        .map(User::getEmail)
        .sorted()
        .collect(Collectors.toList());
}

public record Point(int x, int y) {
    public double distanceTo(Point other) {
        return Math.sqrt(Math.pow(x - other.x, 2) + Math.pow(y - other.y, 2));
    }
}`,
    personalBestWPM: null,
  },
  {
    id: "java-hard",
    title: "Generics & Functional",
    language: "Java",
    difficulty: "hard",
    text: `public class Pipeline<T> {
    private final List<Function<T, T>> steps = new ArrayList<>();

    public Pipeline<T> addStep(Function<T, T> step) {
        steps.add(step);
        return this;
    }

    public T execute(T input) {
        T result = input;
        for (Function<T, T> step : steps) {
            result = step.apply(result);
        }
        return result;
    }

    public <R> R executeAndTransform(T input, Function<T, R> finalizer) {
        return finalizer.apply(execute(input));
    }
}`,
    personalBestWPM: null,
  },

  // ═══════════════════════════════════════
  //  Ruby
  // ═══════════════════════════════════════
  {
    id: "ruby-easy",
    title: "Hashes & Iteration",
    language: "Ruby",
    difficulty: "easy",
    text: `scores = { alice: 95, bob: 87, charlie: 92 }

scores.each do |name, score|
  puts "#{name}: #{score}"
end

top = scores.select { |_, s| s > 90 }
puts top.keys`,
    personalBestWPM: null,
  },
  {
    id: "ruby-med",
    title: "Class & Blocks",
    language: "Ruby",
    difficulty: "medium",
    text: `class TaskRunner
  def initialize(tasks)
    @tasks = tasks
  end

  def run_all
    @tasks.each do |task|
      puts "Running: #{task[:name]}"
      task[:action].call
    end
  end
end`,
    personalBestWPM: null,
  },
  {
    id: "ruby-hard",
    title: "Metaprogramming",
    language: "Ruby",
    difficulty: "hard",
    text: `module Cacheable
  def self.included(base)
    base.extend(ClassMethods)
  end

  module ClassMethods
    def cache_method(name)
      original = instance_method(name)
      define_method(name) do |*args|
        @cache ||= {}
        key = [name, args]
        return @cache[key] if @cache.key?(key)
        @cache[key] = original.bind(self).call(*args)
      end
    end
  end
end

class Calculator
  include Cacheable

  def fib(n)
    return n if n <= 1
    fib(n - 1) + fib(n - 2)
  end
  cache_method :fib
end`,
    personalBestWPM: null,
  },
];
