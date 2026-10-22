// Ordinamento topologico di un DAG (grafo orientato aciclico): una fila di
// tutti i nodi in cui ogni arco u -> v va da sinistra a destra.
// Due algoritmi, entrambi Θ(V + E):
//   - DFS: i nodi in ordine di tempo di fine DECRESCENTE;
//   - Kahn: si toglie ripetutamente un nodo senza archi entranti.
#include <algorithm>
#include <iostream>
#include <queue>
#include <vector>
using namespace std;

using Grafo = vector<vector<int>>;

//@region dfs
void visitaTopo(const Grafo& adj, int u, vector<bool>& visitato, vector<int>& ordine) {
    visitato[u] = true;
    for (int v : adj[u])
        if (!visitato[v]) visitaTopo(adj, v, visitato, ordine);
    ordine.push_back(u);        // u finisce: tutti i nodi raggiungibili da u sono già in ordine
}

vector<int> topologicoDFS(const Grafo& adj) {
    int n = adj.size();
    vector<bool> visitato(n, false);
    vector<int> ordine;
    for (int u = 0; u < n; u++)
        if (!visitato[u]) visitaTopo(adj, u, visitato, ordine);
    reverse(ordine.begin(), ordine.end());          // tempi di fine decrescenti
    return ordine;
}
//@endregion

//@region kahn
vector<int> topologicoKahn(const Grafo& adj) {
    int n = adj.size();
    vector<int> entranti(n, 0);                     // grado entrante di ogni nodo
    for (int u = 0; u < n; u++)
        for (int v : adj[u]) entranti[v]++;         //@conta
    queue<int> q;
    for (int u = 0; u < n; u++)
        if (entranti[u] == 0) q.push(u);            //@sorgenti
    vector<int> ordine;
    while (!q.empty()) {                            //@while
        int u = q.front(); q.pop();                 //@estrai
        ordine.push_back(u);                        //@ordine
        for (int v : adj[u]) {
            entranti[v]--;                          //@togli
            if (entranti[v] == 0) q.push(v);        //@push
        }
    }
    return ordine;              // se ha meno di n nodi, il grafo ha un ciclo //@fine
}
//@endregion

void stampa(const char* nome, const vector<int>& ordine) {
    cout << nome;
    for (int u : ordine) cout << ' ' << u;
    cout << '\n';
}

int main() {
    int n = 7;
    vector<pair<int, int>> archi = {{3, 0}, {3, 1}, {5, 1}, {5, 6},
                                    {0, 2}, {1, 2}, {1, 4}, {6, 4}};
    Grafo adj(n);
    for (auto [u, v] : archi) adj[u].push_back(v);

    stampa("DFS (fine decrescente):", topologicoDFS(adj));
    stampa("Kahn (gradi entranti): ", topologicoKahn(adj));

    adj[2].push_back(3);                            // aggiungo 2 -> 3: ora 3 -> 1 -> 2 -> 3 è un ciclo
    vector<int> o = topologicoKahn(adj);
    cout << "Con l'arco 2 -> 3 Kahn ordina solo " << o.size() << " nodi su " << n
         << ": c'è un ciclo.\n";
    return 0;
}
