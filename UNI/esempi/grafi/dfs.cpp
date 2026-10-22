// Visita in profondità (DFS) ricorsiva di un grafo orientato, con i tempi
// di scoperta d[u] e di fine f[u] del Cormen. Il ciclo in dfs() riparte da
// ogni nodo ancora bianco: il risultato è una foresta DFS.
// In fondo il main classifica gli archi usando solo d e f.
#include <iostream>
#include <vector>
using namespace std;

using Grafo = vector<vector<int>>;
enum Colore { BIANCO, GRIGIO, NERO };

// Globali per brevità: così la funzione ricorsiva ha un solo parametro.
Grafo adj;
vector<Colore> colore;
vector<int> d, f, padre;
int tempo = 0;

//@region dfs
void dfsVisita(int u) {
    colore[u] = GRIGIO;                             //@gray
    d[u] = ++tempo;                                 //@d
    for (int v : adj[u]) {
        if (colore[v] == BIANCO) {                  //@check
            padre[v] = u;                           //@padre
            dfsVisita(v);                           //@call
        }
    }
    colore[u] = NERO;                               //@black
    f[u] = ++tempo;                                 //@f
}

void dfs() {
    int n = adj.size();
    colore.assign(n, BIANCO);
    d.assign(n, 0);
    f.assign(n, 0);
    padre.assign(n, -1);
    tempo = 0;
    for (int u = 0; u < n; u++)                     //@outer
        if (colore[u] == BIANCO) dfsVisita(u);      //@root
}
//@endregion

//@region classifica
// Per l'arco (u, v), a visita finita:
//   albero        se padre[v] == u
//   all'indietro  se v è un antenato di u:      d[v] < d[u] < f[u] < f[v]
//   in avanti     se v è un discendente di u:   d[u] < d[v] < f[v] < f[u]
//   attraversamento altrimenti (v finito prima che u fosse scoperto)
const char* tipoArco(int u, int v) {
    if (padre[v] == u) return "albero";
    if (d[v] < d[u] && f[u] < f[v]) return "all'indietro";
    if (d[u] < d[v] && f[v] < f[u]) return "in avanti";
    return "attraversamento";
}
//@endregion

int main() {
    int n = 6;
    vector<pair<int, int>> archi = {{0, 1}, {0, 2}, {1, 2}, {2, 0},
                                    {3, 2}, {3, 4}, {4, 5}, {5, 3}};
    adj.assign(n, {});
    for (auto [u, v] : archi) adj[u].push_back(v);  // orientato: solo u -> v

    dfs();

    cout << "nodo  d/f    padre\n";
    for (int u = 0; u < n; u++)
        cout << "  " << u << "   " << d[u] << "/" << f[u] << (f[u] < 10 ? "    " : "   ")
             << padre[u] << '\n';

    cout << "Archi:\n";
    for (auto [u, v] : archi)
        cout << "  " << u << " -> " << v << "  " << tipoArco(u, v) << '\n';
    return 0;
}
