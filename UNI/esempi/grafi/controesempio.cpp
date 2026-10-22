// Perché Dijkstra non va usato con pesi negativi: lo stesso grafo dato a
// Dijkstra e a Bellman-Ford. Dijkstra dichiara definitivo il nodo 1 con
// distanza 2, ma passando da 2 si arriva a 1 con 4 + (-3) = 1. Il
// miglioramento di 1 arriva quando 1 è già "fatto": non si propaga a 3.
#include <iostream>
#include <limits>
#include <queue>
#include <vector>
using namespace std;

using GrafoPesato = vector<vector<pair<int, int>>>;
const int INF = numeric_limits<int>::max();

struct Arco {
    int u, v, w;
};

vector<int> dijkstra(const GrafoPesato& adj, int s) {   // la stessa di dijkstra.cpp
    int n = adj.size();
    vector<int> dist(n, INF);
    vector<bool> fatto(n, false);
    priority_queue<pair<int, int>, vector<pair<int, int>>, greater<pair<int, int>>> pq;
    dist[s] = 0;
    pq.push({0, s});
    while (!pq.empty()) {
        auto [d, u] = pq.top(); pq.pop();
        if (fatto[u]) continue;
        fatto[u] = true;
        for (auto [v, w] : adj[u])
            if (dist[u] + w < dist[v]) {
                dist[v] = dist[u] + w;
                pq.push({dist[v], v});
            }
    }
    return dist;
}

vector<int> bellmanFord(int n, const vector<Arco>& archi, int s) {
    vector<int> dist(n, INF);
    dist[s] = 0;
    for (int giro = 1; giro <= n - 1; giro++)
        for (const Arco& a : archi)
            if (dist[a.u] != INF && dist[a.u] + a.w < dist[a.v]) dist[a.v] = dist[a.u] + a.w;
    return dist;
}

int main() {
    int n = 4;
    vector<Arco> archi = {{0, 1, 2}, {0, 2, 4}, {2, 1, -3}, {1, 3, 2}};
    GrafoPesato adj(n);
    for (const Arco& a : archi) adj[a.u].push_back({a.v, a.w});

    vector<int> dj = dijkstra(adj, 0);
    vector<int> bf = bellmanFord(n, archi, 0);
    cout << "nodo  Dijkstra  Bellman-Ford\n";
    for (int v = 0; v < n; v++)
        cout << "  " << v << "       " << dj[v] << "          " << bf[v]
             << (dj[v] != bf[v] ? "   <- sbagliato" : "") << '\n';
    return 0;
}
