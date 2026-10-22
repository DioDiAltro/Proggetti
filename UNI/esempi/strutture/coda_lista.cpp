// Coda (queue) su lista concatenata con due puntatori: si entra in fondo
// (tail) e si esce dalla testa (head). Tutte le operazioni Θ(1).
#include <iostream>
using namespace std;

//@region coda
struct Nodo {
    int val;
    Nodo* next;
};

class CodaLista {
    Nodo* head = nullptr;   // primo nodo: da qui si esce
    Nodo* tail = nullptr;   // ultimo nodo: da qui si entra

public:
    CodaLista() = default;
    ~CodaLista() {
        while (!empty()) dequeue();
    }
    CodaLista(const CodaLista&) = delete;
    CodaLista& operator=(const CodaLista&) = delete;

    bool empty() const { return head == nullptr; }

    void enqueue(int x) {
        Nodo* nuovo = new Nodo{x, nullptr};  //@enq-new
        if (empty())                         //@enq-test
            head = nuovo;                    //@enq-head
        else
            tail->next = nuovo;              //@enq-link
        tail = nuovo;                        //@enq-tail
    }

    int dequeue() {                          // pre: !empty()
        Nodo* tmp = head;                    //@deq-tmp
        int x = tmp->val;                    //@deq-read
        head = head->next;                   //@deq-head
        if (head == nullptr)                 //@deq-test
            tail = nullptr;                  //@deq-tail
        delete tmp;                          //@deq-del
        return x;                            //@deq-ret
    }
};
//@endregion

int main() {
    CodaLista q;
    q.enqueue(8);
    q.enqueue(15);
    cout << "dequeue: " << q.dequeue() << '\n';
    cout << "dequeue: " << q.dequeue() << '\n';   // la coda torna vuota
    q.enqueue(23);                                 // tail era stato azzerato: ok
    q.enqueue(42);
    cout << "svuoto: ";
    while (!q.empty()) cout << q.dequeue() << ' ';
    cout << '\n';
    return 0;
}
