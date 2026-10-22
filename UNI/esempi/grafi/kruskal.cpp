// Algoritmo di Kruskal per l'albero di copertura minimo (MST) di un grafo
// non orientato, connesso e pesato. Si ordinano gli archi per peso e si
// prende ogni arco che unisce due "pezzi" diversi della foresta costruita
// fin qui; un arco con gli estremi già nello stesso pezzo chiuderebbe un
// ciclo e si scarta. I pezzi si gestiscono con una struttura union-find.
#include <algorithm>
#include <iostream>
#include <utility>
#include <vector>
using namespace std;

struct Arco {
    int u, v, w;
    bool operator<(const Arco& o) const {           // ordine per sort: prima il peso,
        if (w != o.w) return w < o.w;               // poi gli estremi (pareggi in ordine fisso)
        if (u != o.u) return u < o.u;
        return v < o.v;
    }
};

//@region unionfind
// Union-find: ogni insieme è un albero; la radice ne è il rappresentante.
struct UnionFind {
    vector<int> padre, rango;

    UnionFind(int n) : padre(n), rango(n, 0) {
        for (int i = 0; i < n; i++) padre[i] = i;   // all'inizio ogni nodo è da solo
    }

    int trova(int x) {                              // rappresentante dell'insieme di x
        if (padre[x] != x)
            padre[x] = trova(padre[x]);             // compressione dei cammini
        return padre[x];
    }

    bool unisci(int a, int b) {                     // false se erano già insieme
        a = trova(a);
        b = trova(b);
        if (a == b) return false;
        if (rango[a] < rango[b]) swap(a, b);        // unione per rango:
        padre[b] = a;                               // l'albero più basso va sotto
        if (rango[a] == rango[b]) rango[a]++;
        return true;
    }
};
//@endregion

//@region kruskal
int kruskal(int n, vector<Arco> archi, vector<Arco>& albero) {
    sort(archi.begin(), archi.end());               //@sort
    UnionFind uf(n);                                //@uf
    int totale = 0;
    for (const Arco& a : archi) {
        if (uf.unisci(a.u, a.v)) {                  //@unisci
            albero.push_back(a);                    //@prendi
            totale += a.w;                          //@totale
        }                       // altrimenti a chiuderebbe un ciclo: scartato
    }
    return totale;                                  //@fine
}
//@endregion

int main() {
    int n = 6;
    vector<Arco> archi = {{0, 1, 1}, {0, 3, 2}, {1, 2, 2}, {1, 4, 3},
                          {2, 3, 1}, {2, 5, 4}, {4, 5, 2}, {2, 4, 5}};
    vector<Arco> albero;
    int totale = kruskal(n, archi, albero);
    cout << "Archi dell'MST (Kruskal), nell'ordine in cui entrano:\n";
    for (const Arco& a : albero) cout << "  " << a.u << " - " << a.v << "  peso " << a.w << '\n';
    cout << "Peso totale: " << totale << '\n';
    return 0;
}
