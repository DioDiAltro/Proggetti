// Algoritmo di Bellman-Ford: cammini minimi da s anche con pesi negativi.
// Fa V-1 giri e in ogni giro rilassa TUTTI gli archi, nell'ordine
// dell'elenco. Un giro in più che riesce ancora a migliorare qualcosa vuol
// dire che c'è un ciclo di peso negativo raggiungibile da s. Costo Θ(V·E).
#include <iostream>
#include <limits>
#include <vector>
using namespace std;

const int INF = numeric_limits<int>::max();

struct Arco {
    int u, v, w;                                    // arco u -> v di peso w
};

//@region bf
bool bellmanFord(int n, const vector<Arco>& archi, int s, vector<int>& dist, vector<int>& padre) {
    dist.assign(n, INF);
    padre.assign(n, -1);
    dist[s] = 0;                                    //@init
    for (int giro = 1; giro <= n - 1; giro++) {     //@giro
        for (const Arco& a : archi) {
            if (dist[a.u] != INF && dist[a.u] + a.w < dist[a.v]) {   //@relax
                dist[a.v] = dist[a.u] + a.w;        //@update
                padre[a.v] = a.u;                   //@padre
            }
        }
    }
    for (const Arco& a : archi) {                   // giro di controllo
        if (dist[a.u] != INF && dist[a.u] + a.w < dist[a.v])         //@verifica
            return false;                           // migliora ancora: ciclo negativo //@negativo
    }
    return true;                                    //@ok
}
//@endregion

void prova(int n, const vector<Arco>& archi) {
    vector<int> dist, padre;
    if (bellmanFord(n, archi, 0, dist, padre)) {
        cout << "dist:";
        for (int v = 0; v < n; v++) cout << ' ' << dist[v];
        cout << "   padre:";
        for (int v = 0; v < n; v++) cout << ' ' << padre[v];
        cout << '\n';
    } else {
        cout << "c'è un ciclo di peso negativo raggiungibile da 0\n";
    }
}

int main() {
    int n = 5;
    // l'ordine dell'elenco conta: questo è "sfortunato" e servono tutti i V-1 giri
    vector<Arco> archi = {{3, 4, 2}, {1, 3, 3}, {2, 1, -2},
                          {0, 2, 5}, {0, 1, 4}, {2, 4, 6}};
    prova(n, archi);

    archi.push_back({3, 2, -5});                    // 2 -> 1 -> 3 -> 2 pesa -2 + 3 - 5 = -4
    prova(n, archi);
    return 0;
}
