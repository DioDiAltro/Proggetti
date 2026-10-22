// Coda (queue) su array circolare di capacità fissa.
// head = indice del primo elemento, tail = prima casella libera.
// Gli indici avanzano "modulo cap": dopo l'ultima casella si torna alla 0.
#include <iostream>
using namespace std;

//@region coda
class Coda {
    int* a;
    int cap;
    int head = 0;   // indice del primo elemento (il prossimo a uscire)
    int tail = 0;   // indice della prima casella libera (dove entra il prossimo)
    int n = 0;      // elementi presenti: distingue la coda piena da quella vuota

public:
    explicit Coda(int c) : a(new int[c]), cap(c) {}
    ~Coda() { delete[] a; }
    Coda(const Coda&) = delete;
    Coda& operator=(const Coda&) = delete;

    bool empty() const { return n == 0; }
    bool full() const { return n == cap; }

    bool enqueue(int x) {
        if (full()) return false;            //@enq-full
        a[tail] = x;                         //@enq-write
        tail = (tail + 1) % cap;             //@enq-tail
        n++;                                 //@enq-n
        return true;                         //@enq-ok
    }

    int front() const { return a[head]; }    // pre: !empty()

    int dequeue() {                          // pre: !empty()
        int x = a[head];                     //@deq-read
        head = (head + 1) % cap;             //@deq-head
        n--;                                 //@deq-n
        return x;                            //@deq-ret
    }
};
//@endregion

int main() {
    Coda q(5);
    for (int x = 1; x <= 4; x++) q.enqueue(x);
    cout << "dequeue: " << q.dequeue() << '\n';
    cout << "dequeue: " << q.dequeue() << '\n';
    for (int x = 5; x <= 8; x++)             // tail fa il giro e riparte da 0
        cout << "enqueue " << x << (q.enqueue(x) ? ": ok" : ": coda piena") << '\n';
    cout << "svuoto: ";
    while (!q.empty()) cout << q.dequeue() << ' ';   // esce in ordine di arrivo: FIFO
    cout << '\n';
    return 0;
}
