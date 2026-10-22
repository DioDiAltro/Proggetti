// Algoritmo di Prim per l'albero di copertura minimo (MST) di un grafo non
// orientato, connesso e pesato. L'albero cresce da un nodo: a ogni passo
// entra il nodo fuori dall'albero collegato con l'arco più leggero.
// key[v] = peso dell'arco più leggero che collega v all'albero.
// Stessa struttura di Dijkstra: cambia solo cosa si mette in coda.
#include <iostream>
#include <limits>
#include <queue>
#include <vector>
using namespace std;

using GrafoPesato = vector<vector<pair<int, int>>>;   // adj[u] = coppie (v, peso)
const int INF = numeric_limits<int>::max();

//@region prim
int prim(const GrafoPesato& adj, vector<int>& padre) {
    int n = adj.size();
    vector<int> key(n, INF);
    vector<bool> inAlbero(n, false);
    padre.assign(n, -1);
    // coppie (peso, nodo): in cima l'arco più leggero verso un nodo
    priority_queue<pair<int, int>, vector<pair<int, int>>, greater<pair<int, int>>> pq;
    key[0] = 0;                                     //@init
    pq.push({0, 0});                                //@push-s
    int totale = 0;
    while (!pq.empty()) {                           //@while
        auto [k, u] = pq.top(); pq.pop();           //@top
        if (inAlbero[u]) continue;                  //@skip
        inAlbero[u] = true;                         //@prendi
        totale += k;                                //@totale
        for (auto [v, w] : adj[u]) {
            if (!inAlbero[v] && w < key[v]) {       //@relax
                key[v] = w;                         //@key
                padre[v] = u;                       //@padre
                pq.push({w, v});                    //@push
            }
        }
    }
    return totale;                                  //@fine
}
//@endregion

struct Arco {
    int u, v, w;
};

int main() {
    int n = 6;
    vector<Arco> archi = {{0, 1, 1}, {0, 3, 2}, {1, 2, 2}, {1, 4, 3},
                          {2, 3, 1}, {2, 5, 4}, {4, 5, 2}, {2, 4, 5}};
    GrafoPesato adj(n);
    for (const Arco& a : archi) {                   // non orientato: in tutte e due le liste
        adj[a.u].push_back({a.v, a.w});
        adj[a.v].push_back({a.u, a.w});
    }
    vector<int> padre;
    int totale = prim(adj, padre);
    cout << "Archi dell'MST (Prim, partendo da 0):\n";
    for (int v = 1; v < n; v++)
        cout << "  " << padre[v] << " - " << v << '\n';
    cout << "Peso totale: " << totale << '\n';
    return 0;
}
