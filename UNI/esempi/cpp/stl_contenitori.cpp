// Adattatori e altri contenitori: stack, queue, deque, priority_queue, pair.
#include <algorithm>
#include <deque>
#include <functional>   // greater
#include <iostream>
#include <queue>        // queue e priority_queue
#include <stack>
#include <string>
#include <utility>      // pair
#include <vector>
using namespace std;

int main() {
//@region stack
    stack<int> s;                           // LIFO: l'ultimo entrato esce per primo
    for (int x : {1, 2, 3}) s.push(x);
    cout << "stack:";
    while (!s.empty()) {
        cout << ' ' << s.top();             // legge la cima...
        s.pop();                            // ...e la toglie (pop non restituisce nulla)
    }
    cout << '\n';
//@endregion

//@region queue
    queue<int> q;                           // FIFO: il primo entrato esce per primo
    for (int x : {1, 2, 3}) q.push(x);
    cout << "queue:";
    while (!q.empty()) {
        cout << ' ' << q.front();
        q.pop();
    }
    cout << '\n';
//@endregion

//@region deque
    deque<int> d = {2, 3};
    d.push_front(1);                        // in testa: O(1)
    d.push_back(4);                         // in fondo: O(1)
    cout << "deque: " << d.front() << " ... " << d.back() << ", d[1] = " << d[1] << '\n';
//@endregion

//@region pq
    priority_queue<int> pqMax;                              // in cima il più grande
    priority_queue<int, vector<int>, greater<int>> pqMin;   // in cima il più piccolo
    for (int x : {5, 1, 8, 3}) {
        pqMax.push(x);
        pqMin.push(x);
    }
    cout << "priority_queue (max):";
    while (!pqMax.empty()) {
        cout << ' ' << pqMax.top();
        pqMax.pop();
    }
    cout << "\npriority_queue (min):";
    while (!pqMin.empty()) {
        cout << ' ' << pqMin.top();
        pqMin.pop();
    }
    cout << '\n';
//@endregion

//@region pair
    pair<int, string> p = {3, "tre"};
    cout << "pair: " << p.first << ' ' << p.second << '\n';
    vector<pair<int, char>> coppie = {{2, 'b'}, {1, 'z'}, {2, 'a'}};
    sort(coppie.begin(), coppie.end());     // prima per first, a parità per second
    for (auto [num, lettera] : coppie) cout << num << lettera << ' ';
    cout << '\n';
//@endregion
    return 0;
}
