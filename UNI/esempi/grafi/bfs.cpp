// Visita in ampiezza (BFS) di un grafo non orientato, con i colori del
// Cormen: BIANCO = non ancora scoperto, GRIGIO = scoperto (sta in coda o è
// in lavorazione), NERO = tutti i suoi vicini sono stati esaminati.
// dist[v] è il numero minimo di archi da s a v; padre[] è l'albero BFS.
#include <algorithm>
#include <iostream>
#include <queue>
#include <vector>
using namespace std;

using Grafo = vector<vector<int>>;                  // liste di adiacenza
enum Colore { BIANCO, GRIGIO, NERO };

//@region bfs
void bfs(const Grafo& adj, int s, vector<int>& dist, vector<int>& padre) {
    int n = adj.size();
    vector<Colore> colore(n, BIANCO);
    dist.assign(n, -1);                             // -1: non raggiunto
    padre.assign(n, -1);
    queue<int> q;
    colore[s] = GRIGIO;                             //@init
    dist[s] = 0;                                    //@init-d
    q.push(s);                                      //@push-s
    while (!q.empty()) {                            //@while
        int u = q.front(); q.pop();                 //@front
        for (int v : adj[u]) {
            if (colore[v] == BIANCO) {              //@check
                colore[v] = GRIGIO;                 //@gray
                dist[v] = dist[u] + 1;              //@dist
                padre[v] = u;                       //@padre
                q.push(v);                          //@push
            }
        }
        colore[u] = NERO;                           //@black
    }
}
//@endregion

//@region cammino
// Il cammino minimo da s a t si legge al contrario, risalendo i padri.
vector<int> cammino(const vector<int>& padre, int t) {
    vector<int> c;
    for (int v = t; v != -1; v = padre[v]) c.push_back(v);
    reverse(c.begin(), c.end());                    // da s a t
    return c;
}
//@endregion

int main() {
    int n = 7;
    vector<pair<int, int>> archi = {{0, 1}, {0, 2}, {1, 3}, {1, 4}, {2, 3},
                                    {2, 5}, {3, 6}, {4, 6}, {5, 6}};
    Grafo adj(n);
    for (auto [u, v] : archi) {
        adj[u].push_back(v);
        adj[v].push_back(u);
    }

    vector<int> dist, padre;
    bfs(adj, 0, dist, padre);

    cout << "nodo  dist  padre\n";
    for (int v = 0; v < n; v++)
        cout << "  " << v << "     " << dist[v] << "     " << padre[v] << '\n';

    cout << "Archi dell'albero BFS:";
    for (int v = 0; v < n; v++)
        if (padre[v] != -1) cout << " (" << padre[v] << "," << v << ")";
    cout << '\n';

    cout << "Cammino minimo da 0 a 6:";
    for (int v : cammino(padre, 6)) cout << ' ' << v;
    cout << "  (" << dist[6] << " archi)\n";
    return 0;
}
