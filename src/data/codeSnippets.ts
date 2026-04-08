export interface CodeSnippet {
  id: string;
  title: string;
  language: string;
  text: string;
  personalBestWPM: number | null;
}

// Each snippet uses real, idiomatic code with proper formatting.
// \n for newlines, spaces for indentation (2-space or 4-space per language convention).

export const defaultCodeSnippets: CodeSnippet[] = [
  // ── JavaScript / TypeScript ──
  {
    id: "code-js-1",
    title: "Array Methods",
    language: "JavaScript",
    text: `function processUsers(users) {
  const active = users.filter(u => u.isActive);
  const names = active.map(u => u.name);
  const sorted = names.sort((a, b) => a.localeCompare(b));
  return sorted.join(", ");
}`,
    personalBestWPM: null,
  },
  {
    id: "code-ts-1",
    title: "Generic Interface",
    language: "TypeScript",
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
  // ── Python ──
  {
    id: "code-py-1",
    title: "List Comprehension",
    language: "Python",
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
    id: "code-py-2",
    title: "Class Definition",
    language: "Python",
    text: `class Vector:
    def __init__(self, x, y):
        self.x = x
        self.y = y

    def __add__(self, other):
        return Vector(self.x + other.x, self.y + other.y)

    def magnitude(self):
        return (self.x ** 2 + self.y ** 2) ** 0.5`,
    personalBestWPM: null,
  },
  // ── Swift ──
  {
    id: "code-swift-1",
    title: "Struct & Protocol",
    language: "Swift",
    text: `protocol Drawable {
    func draw() -> String
}

struct Circle: Drawable {
    let radius: Double

    func draw() -> String {
        return "Circle with radius \\(radius)"
    }

    var area: Double {
        return .pi * radius * radius
    }
}`,
    personalBestWPM: null,
  },
  {
    id: "code-swift-2",
    title: "Enum & Switch",
    language: "Swift",
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
  // ── C ──
  {
    id: "code-c-1",
    title: "Linked List",
    language: "C",
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
    id: "code-c-2",
    title: "String Reverse",
    language: "C",
    text: `void reverse(char* str) {
    int len = strlen(str);
    for (int i = 0; i < len / 2; i++) {
        char tmp = str[i];
        str[i] = str[len - 1 - i];
        str[len - 1 - i] = tmp;
    }
}`,
    personalBestWPM: null,
  },
  // ── C++ ──
  {
    id: "code-cpp-1",
    title: "Template Class",
    language: "C++",
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
    id: "code-cpp-2",
    title: "Smart Pointers",
    language: "C++",
    text: `auto createWidget(const std::string& name) {
    auto widget = std::make_unique<Widget>(name);
    widget->init();
    return widget;
}

void process() {
    auto w = createWidget("button");
    auto shared = std::make_shared<Widget>("label");
    std::cout << shared->getName() << std::endl;
}`,
    personalBestWPM: null,
  },
  // ── Rust ──
  {
    id: "code-rust-1",
    title: "Ownership & Match",
    language: "Rust",
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
  // ── Go ──
  {
    id: "code-go-1",
    title: "HTTP Handler",
    language: "Go",
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
  // ── Java ──
  {
    id: "code-java-1",
    title: "Stream API",
    language: "Java",
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
  // ── Ruby ──
  {
    id: "code-ruby-1",
    title: "Class & Blocks",
    language: "Ruby",
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
];
