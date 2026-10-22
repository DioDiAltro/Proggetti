// Algoritmo di Dijkstra con std::priority_queue: cammini minimi da una
// sorgente s in un grafo orientato con pesi NON negativi.
// La coda con priorità della STL non sa diminuire una chiave: quando
// dist[v] migliora si inserisce una coppia nuova, e la vecchia resta in coda.
// Quando la vecchia esce, u è già "fatto" e la si salta (cancellazione pigra).
#include <algorithm>
#include <iostream>
#include <limits>
#include <queue>
#include <vector>
using namespace std;

using GrafoPesato = vector<vector<pair<int, int>>>;   // adj[u] = coppie (v, peso)
const int INF = numeric_limits<int>::max();           // "infinito": nodo non ancora raggiunto

//@region dijkstra
vector<int> dijkstra(const GrafoPesato& adj, int s, vector<int>& padre) {
    int n = adj.size();
    vector<int> dist(n, INF);
    vector<bool> fatto(n, false);                   // fatto[u]: dist[u] è definitiva
    padre.assign(n, -1);
    // coppie (distanza, nodo); greater: in cima c'è la distanza MINORE
    priority_queue<pair<int, int>, vector<pair<int, int>>, greater<pair<int, int>>> pq;
    dist[s] = 0;                                    //@init
    pq.push({0, s});                                //@push-s
    while (!pq.empty()) {                           //@while
        auto [d, u] = pq.top(); pq.pop();           //@top
        if (fatto[u]) continue;                     //@skip
        fatto[u] = true;                            //@fatto
        for (auto [v, w] : adj[u]) {
            if (dist[u] + w < dist[v]) {            //@relax
                dist[v] = dist[u] + w;              //@update
                padre[v] = u;                       //@padre
                pq.push({dist[v], v});              //@push
            }
        }
    }
    return dist;
}
//@endregion

//@region cammino
vector<int> cammino(const vector<int>& padre, int t) {
    vector<int> c;
    for (int v = t; v != -1; v = padre[v])          // risale da t fino alla sorgente
        c.push_back(v);
    reverse(c.begin(), c.end());
    return c;
}
//@endregion

struct Arco {
    int u, v, w;
};

int main() {
    int n = 6;
    vector<Arco> archi = {{0, 1, 7}, {0, 2, 2}, {2, 1, 3}, {2, 4, 8},
                          {1, 3, 1}, {1, 4, 2}, {3, 5, 5}, {4, 5, 1}};
    GrafoPesato adj(n);
    for (const Arco& a : archi) adj[a.u].push_back({a.v, a.w});   // orientato

    vector<int> padre;
    vector<int> dist = dijkstra(adj, 0, padre);

    for (int v = 0; v < n; v++) {
        cout << "dist[" << v << "] = " << dist[v] << "   cammino:";
        for (int x : cammino(padre, v)) cout << ' ' << x;
        cout << '\n';
    }
    return 0;
}
