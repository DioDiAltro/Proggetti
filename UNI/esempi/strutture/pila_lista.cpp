// Pila (stack) su lista concatenata: la cima è il primo nodo.
// push = inserimento in testa, pop = cancellazione in testa: Θ(1) sempre.
#include <iostream>
using namespace std;

//@region pila
struct Nodo {
    int val;
    Nodo* next;
};

class PilaLista {
    Nodo* cima = nullptr;                    // primo nodo della lista

public:
    PilaLista() = default;
    ~PilaLista() {                           // libera i nodi rimasti
        while (!empty()) pop();
    }
    PilaLista(const PilaLista&) = delete;
    PilaLista& operator=(const PilaLista&) = delete;

    bool empty() const { return cima == nullptr; }
    void push(int x) { cima = new Nodo{x, cima}; }   // in testa
    int top() const { return cima->val; }            // pre: !empty()
    void pop() {                                     // pre: !empty()
        Nodo* tmp = cima;
        cima = cima->next;
        delete tmp;
    }
};
//@endregion

int main() {
    PilaLista p;
    for (int x = 1; x <= 4; x++) p.push(x);
    cout << "top: " << p.top() << '\n';
    p.pop();
    cout << "dopo pop, top: " << p.top() << '\n';
    p.push(9);
    cout << "svuoto: ";
    while (!p.empty()) {
        cout << p.top() << ' ';
        p.pop();
    }
    cout << '\n';
    p.push(7);                               // resta un nodo: lo libera il distruttore
    return 0;
}
