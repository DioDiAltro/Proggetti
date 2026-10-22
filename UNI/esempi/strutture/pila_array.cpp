// Pila (stack) su array dinamico: la cima è l'ultima casella occupata.
// Quando l'array è pieno se ne alloca uno grande il doppio: push costa
// Θ(1) ammortizzato, pop e top Θ(1).
#include <iostream>
using namespace std;

//@region pila
class Pila {
    int* a;       // array dinamico con gli elementi
    int cap;      // capacità dell'array
    int n = 0;    // elementi presenti: la cima è a[n - 1]

    void cresci() {                          // Θ(n), ma capita di rado
        int* b = new int[2 * cap];           //@g-new
        for (int i = 0; i < n; i++)          //@g-for
            b[i] = a[i];                     //@g-copy
        delete[] a;                          //@g-del
        a = b;                               //@g-swap
        cap = 2 * cap;                       //@g-cap
    }

public:
    explicit Pila(int c = 4) : a(new int[c]), cap(c) {}
    ~Pila() { delete[] a; }
    Pila(const Pila&) = delete;              // niente copie: l'array
    Pila& operator=(const Pila&) = delete;   // appartiene a questa pila

    bool empty() const { return n == 0; }
    int size() const { return n; }

    void push(int x) {
        if (n == cap) cresci();              //@push-full
        a[n] = x;                            //@push-write
        n++;                                 //@push-inc
    }
    int top() const { return a[n - 1]; }     // pre: !empty()   //@top
    void pop() { n--; }                      // pre: !empty()   //@pop
};
//@endregion

int main() {
    Pila p(2);                               // capacità iniziale piccola apposta
    for (int x = 1; x <= 5; x++) {
        p.push(x * 10);
        cout << "push " << x * 10 << "  -> size " << p.size() << '\n';
    }
    cout << "svuoto: ";
    while (!p.empty()) {                     // esce in ordine inverso: LIFO
        cout << p.top() << ' ';
        p.pop();
    }
    cout << '\n';
    return 0;
}
