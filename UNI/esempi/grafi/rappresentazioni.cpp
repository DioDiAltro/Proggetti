// Lo stesso grafo non orientato in due rappresentazioni, costruite
// dall'elenco degli archi: matrice di adiacenza e liste di adiacenza.
// In fondo la versione pesata delle liste, con coppie (vicino, peso).
// I nodi sono numerati da 0 a n-1, come gli indici di un vector.
#include <iostream>
#include <utility>
#include <vector>
using namespace std;

//@region liste
vector<vector<int>> costruisciListe(int n, const vector<pair<int, int>>& archi) {
    vector<vector<int>> adj(n);                     //@crea
    for (auto [u, v] : archi) {                     //@arco
        adj[u].push_back(v);                        //@uv
        adj[v].push_back(u);    // non orientato: anche v -> u //@vu
    }
    return adj;                                     //@fine
}
//@endregion

//@region matrice
vector<vector<int>> costruisciMatrice(int n, const vector<pair<int, int>>& archi) {
    vector<vector<int>> M(n, vector<int>(n, 0));    // n x n caselle, tutte 0
    for (auto [u, v] : archi) {
        M[u][v] = 1;
        M[v][u] = 1;            // non orientato: la matrice è simmetrica
    }
    return M;
}
//@endregion

//@region domande
// "(u, v) è un arco?": con la matrice basta una casella...
bool arcoMatrice(const vector<vector<int>>& M, int u, int v) {
    return M[u][v] == 1;                            // Θ(1)
}

// ...con le liste bisogna scorrere adj[u].
bool arcoListe(const vector<vector<int>>& adj, int u, int v) {
    for (int x : adj[u])                            // O(grado(u))
        if (x == v) return true;
    return false;
}
//@endregion

//@region pesato
struct Arco {
    int u, v, w;                                    // estremi e peso
};

vector<vector<pair<int, int>>> costruisciPesato(int n, const vector<Arco>& archi) {
    vector<vector<pair<int, int>>> adj(n);          // adj[u] = coppie (vicino, peso)
    for (const Arco& a : archi) {
        adj[a.u].push_back({a.v, a.w});
        adj[a.v].push_back({a.u, a.w});
    }
    return adj;
}
//@endregion

int main() {
    //@region main
    int n = 6;
    vector<pair<int, int>> archi = {{0, 1}, {0, 3}, {0, 4}, {1, 2},
                                    {1, 4}, {3, 4}, {4, 5}, {2, 5}};
    vector<vector<int>> adj = costruisciListe(n, archi);
    vector<vector<int>> M = costruisciMatrice(n, archi);
    //@endregion

    cout << "Matrice di adiacenza (" << n << " x " << n << "):\n    ";
    for (int j = 0; j < n; j++) cout << j << ' ';
    cout << '\n';
    for (int i = 0; i < n; i++) {
        cout << ' ' << i << ": ";
        for (int j = 0; j < n; j++) cout << M[i][j] << ' ';
        cout << '\n';
    }

    cout << "\nListe di adiacenza:\n";
    int somma = 0;
    for (int u = 0; u < n; u++) {
        cout << " adj[" << u << "]:";
        for (int v : adj[u]) cout << ' ' << v;
        cout << "   (grado " << adj[u].size() << ")\n";
        somma += adj[u].size();
    }
    cout << "Somma dei gradi = " << somma << " = 2 * " << archi.size() << " archi\n";

    cout << "\n(1, 4) è un arco? " << (arcoMatrice(M, 1, 4) ? "sì" : "no")
         << " / " << (arcoListe(adj, 1, 4) ? "sì" : "no") << '\n';
    cout << "(2, 3) è un arco? " << (arcoMatrice(M, 2, 3) ? "sì" : "no")
         << " / " << (arcoListe(adj, 2, 3) ? "sì" : "no") << '\n';

    vector<Arco> pesati = {{0, 1, 4}, {0, 3, 2}, {0, 4, 5}, {1, 2, 3},
                           {1, 4, 1}, {3, 4, 6}, {4, 5, 2}, {2, 5, 7}};
    vector<vector<pair<int, int>>> adjP = costruisciPesato(n, pesati);
    cout << "\nListe pesate, coppie (vicino, peso):\n";
    for (int u = 0; u < n; u++) {
        cout << " adj[" << u << "]:";
        for (auto [v, w] : adjP[u]) cout << " (" << v << ", " << w << ")";
        cout << '\n';
    }
    return 0;
}
