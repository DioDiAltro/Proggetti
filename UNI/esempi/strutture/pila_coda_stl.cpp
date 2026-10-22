// Pile e code già pronte nella libreria standard: stack, queue e deque.
#include <iostream>
#include <stack>
#include <queue>
#include <deque>
using namespace std;

int main() {
    //@region stack
    stack<int> s;                 // pila: si entra e si esce dalla cima
    s.push(1);
    s.push(2);
    s.push(3);
    cout << "stack: top = " << s.top() << ", size = " << s.size() << '\n';
    s.pop();                      // pop() toglie la cima ma NON la restituisce
    cout << "dopo pop: top = " << s.top() << '\n';
    //@endregion

    //@region queue
    queue<int> q;                 // coda: si entra in fondo, si esce davanti
    q.push(1);
    q.push(2);
    q.push(3);
    cout << "queue: front = " << q.front() << ", back = " << q.back() << '\n';
    q.pop();                      // toglie il primo arrivato
    cout << "dopo pop: front = " << q.front() << '\n';
    //@endregion

    //@region deque
    deque<int> d = {2, 3};        // "double-ended queue": si lavora ai due capi
    d.push_front(1);
    d.push_back(4);
    cout << "deque: ";
    for (int x : d) cout << x << ' ';
    cout << "  d[2] = " << d[2] << '\n';   // anche l'accesso per indice è Θ(1)
    d.pop_front();
    d.pop_back();
    cout << "dopo pop_front e pop_back: " << d.front() << ' ' << d.back() << '\n';
    //@endregion

    //@region svuota
    while (!s.empty()) {          // prima si legge top(), poi si fa pop()
        cout << "tolgo " << s.top() << '\n';
        s.pop();
    }
    //@endregion
    return 0;
}
