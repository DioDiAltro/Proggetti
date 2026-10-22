// Esercizio: conta le componenti connesse di un grafo non orientato dato
// con liste di adiacenza. Ogni DFS lanciata da un vertice non ancora visitato
// scopre una componente intera. Costo Θ(V + E).
#include <iostream>
#include <vector>
using namespace std;

//@region soluzione
void dfs(const vector<vector<int>>& adj, int u, vector<bool>& visitato) {
    visitato[u] = true;
    for (int v : adj[u])
        if (!visitato[v]) dfs(adj, v, visitato);
}

int contaComponenti(const vector<vector<int>>& adj) {
    int n = adj.size();
    vector<bool> visitato(n, false);
    int componenti = 0;
    for (int u = 0; u < n; u++) {
        if (!visitato[u]) {
            componenti++;                 // u inizia una componente nuova
            dfs(adj, u, visitato);
        }
    }
    return componenti;
}
//@endregion

int main() {
    int n = 7;
    vector<pair<int, int>> archi = {{0, 1}, {1, 2}, {3, 4}, {5, 6}};
    vector<vector<int>> adj(n);
    for (auto [u, v] : archi) {
        adj[u].push_back(v);
        adj[v].push_back(u);
    }
    cout << "componenti: " << contaComponenti(adj) << '\n';   // {0,1,2} {3,4} {5,6}
    return 0;
}
