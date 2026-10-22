// Code con priorità della libreria standard: std::priority_queue.
// È un heap su un vector: push e pop costano O(log n), top costa O(1).
#include <functional>
#include <iostream>
#include <queue>
#include <string>
#include <utility>
#include <vector>
using namespace std;

int main() {
    //@region max
    priority_queue<int> pq;              // max-heap
    for (int x : {5, 13, 2, 25, 7})
        pq.push(x);                      // O(log n)

    cout << "top: " << pq.top() << '\n';    // O(1)
    cout << "estratti:";
    while (!pq.empty()) {
        cout << ' ' << pq.top();         // prima leggi...
        pq.pop();                        // ...poi togli
    }
    cout << '\n';
    //@endregion

    //@region min
    // min-heap: il terzo parametro rovescia il confronto
    priority_queue<int, vector<int>, greater<int>> mq;
    for (int x : {5, 13, 2, 25, 7})
        mq.push(x);

    cout << "estratti dal min-heap:";
    while (!mq.empty()) {
        cout << ' ' << mq.top();
        mq.pop();
    }
    cout << '\n';
    //@endregion

    //@region coppie
    // Le coppie si confrontano sul primo campo
    // (a pari merito, sul secondo).
    priority_queue<pair<int, string>> lavori;
    lavori.push({2, "stampa"});
    lavori.push({5, "backup"});
    lavori.push({1, "pulizia"});
    while (!lavori.empty()) {
        auto [p, nome] = lavori.top();
        lavori.pop();
        cout << "priorità " << p << ": " << nome << '\n';
    }
    //@endregion
    return 0;
}
