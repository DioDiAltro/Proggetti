// C'è un ciclo? Due versioni, perché la risposta dipende dal tipo di grafo.
// Orientato: un ciclo c'è se e solo se la DFS trova un arco verso un nodo
// GRIGIO (un antenato ancora aperto: arco all'indietro).
// Non orientato: un ciclo c'è se la visita trova un vicino già visitato
// che non è il nodo da cui siamo appena arrivati (il padre).
#include <iostream>
#include <vector>
using namespace std;

using Grafo = vector<vector<int>>;
enum Colore { BIANCO, GRIGIO, NERO };

//@region orientato
bool cicloDa(const Grafo& adj, int u, vector<Colore>& colore) {
    colore[u] = GRIGIO;
    for (int v : adj[u]) {
        if (colore[v] == GRIGIO) return true;       // arco all'indietro: ciclo
        if (colore[v] == BIANCO && cicloDa(adj, v, colore)) return true;
    }
    colore[u] = NERO;
    return false;
}

bool haCicloOrientato(const Grafo& adj) {
    vector<Colore> colore(adj.size(), BIANCO);
    for (int u = 0; u < (int)adj.size(); u++)
        if (colore[u] == BIANCO && cicloDa(adj, u, colore)) return true;
    return false;
}
//@endregion

//@region non-orientato
bool cicloDaNO(const Grafo& adj, int u, int p, vector<bool>& visitato) {
    visitato[u] = true;
    for (int v : adj[u]) {
        if (!visitato[v]) {
            if (cicloDaNO(adj, v, u, visitato)) return true;
        } else if (v != p) {
            return true;                            // già visitato e non è il padre
        }
    }
    return false;
}

bool haCicloNonOrientato(const Grafo& adj) {
    vector<bool> visitato(adj.size(), false);
    for (int u = 0; u < (int)adj.size(); u++)
        if (!visitato[u] && cicloDaNO(adj, u, -1, visitato)) return true;
    return false;
}
//@endregion

Grafo orientato(int n, const vector<pair<int, int>>& archi) {
    Grafo adj(n);
    for (auto [u, v] : archi) adj[u].push_back(v);
    return adj;
}

Grafo nonOrientato(int n, const vector<pair<int, int>>& archi) {
    Grafo adj(n);
    for (auto [u, v] : archi) {
        adj[u].push_back(v);
        adj[v].push_back(u);
    }
    return adj;
}

int main() {
    // lo stesso elenco di archi letto nei due modi
    vector<pair<int, int>> archi = {{0, 1}, {1, 2}, {0, 2}, {2, 3}};
    cout << boolalpha;
    cout << "Orientato     0->1, 1->2, 0->2, 2->3: ciclo? "
         << haCicloOrientato(orientato(4, archi)) << '\n';
    cout << "Non orientato 0-1, 1-2, 0-2, 2-3:     ciclo? "
         << haCicloNonOrientato(nonOrientato(4, archi)) << '\n';

    vector<pair<int, int>> archi2 = {{0, 1}, {1, 2}, {2, 0}, {2, 3}};
    cout << "Orientato     0->1, 1->2, 2->0, 2->3: ciclo? "
         << haCicloOrientato(orientato(4, archi2)) << '\n';

    vector<pair<int, int>> albero = {{0, 1}, {0, 2}, {2, 3}};
    cout << "Non orientato 0-1, 0-2, 2-3:          ciclo? "
         << haCicloNonOrientato(nonOrientato(4, albero)) << '\n';
    return 0;
}
