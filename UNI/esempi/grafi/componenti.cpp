// Componenti connesse di un grafo non orientato: si lancia una visita da
// ogni nodo non ancora visitato e si segnano con lo stesso numero tutti i
// nodi che quella visita raggiunge. Costo totale Θ(V + E).
#include <iostream>
#include <vector>
using namespace std;

using Grafo = vector<vector<int>>;

//@region componenti
void visita(const Grafo& adj, int u, int c, vector<int>& comp) {
    comp[u] = c;                                    // u sta nella componente c
    for (int v : adj[u])
        if (comp[v] == -1) visita(adj, v, c, comp);
}

int componenti(const Grafo& adj, vector<int>& comp) {
    int n = adj.size();
    comp.assign(n, -1);                             // -1: non ancora visitato
    int c = 0;
    for (int u = 0; u < n; u++)
        if (comp[u] == -1) {                        // u apre una componente nuova
            visita(adj, u, c, comp);
            c++;
        }
    return c;
}
//@endregion

int main() {
    int n = 8;
    vector<pair<int, int>> archi = {{0, 1}, {0, 2}, {1, 2}, {2, 3},
                                    {4, 5}, {6, 7}};
    Grafo adj(n);
    for (auto [u, v] : archi) {
        adj[u].push_back(v);
        adj[v].push_back(u);
    }

    vector<int> comp;
    int c = componenti(adj, comp);
    cout << "Componenti connesse: " << c << '\n';
    for (int k = 0; k < c; k++) {
        cout << "  componente " << k << ":";
        for (int u = 0; u < n; u++)
            if (comp[u] == k) cout << ' ' << u;
        cout << '\n';
    }
    cout << "0 e 3 sono collegati? " << (comp[0] == comp[3] ? "sì" : "no") << '\n';
    cout << "0 e 4 sono collegati? " << (comp[0] == comp[4] ? "sì" : "no") << '\n';
    return 0;
}
