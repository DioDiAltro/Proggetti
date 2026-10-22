// Floyd-Warshall: le distanze minime fra TUTTE le coppie di nodi.
// D[i][j] parte dal peso dell'arco i -> j (INF se non c'è, 0 sulla diagonale).
// Al passo k si permette ai cammini di passare anche dal nodo k:
// conviene se i -> k -> j costa meno del miglior i -> j trovato finora.
// Tre cicli annidati su n nodi: Θ(n^3). Pesi negativi ammessi, cicli negativi no.
#include <iostream>
#include <limits>
#include <vector>
using namespace std;

const int INF = numeric_limits<int>::max();

//@region fw
void floydWarshall(vector<vector<int>>& D) {
    int n = D.size();
    for (int k = 0; k < n; k++)
        for (int i = 0; i < n; i++)
            for (int j = 0; j < n; j++)
                if (D[i][k] != INF && D[k][j] != INF && D[i][k] + D[k][j] < D[i][j])
                    D[i][j] = D[i][k] + D[k][j];
}
//@endregion

void stampa(const vector<vector<int>>& D) {
    for (const vector<int>& riga : D) {
        for (int x : riga) {
            if (x == INF) cout << "  inf";
            else {
                cout.width(5);
                cout << x;
            }
        }
        cout << '\n';
    }
}

int main() {
    int n = 4;
    vector<vector<int>> D(n, vector<int>(n, INF));
    for (int i = 0; i < n; i++) D[i][i] = 0;
    D[0][1] = 3;
    D[0][3] = 7;
    D[1][2] = 2;
    D[2][0] = 5;
    D[2][3] = 1;
    D[3][0] = 2;

    cout << "Prima (pesi degli archi):\n";
    stampa(D);
    floydWarshall(D);
    cout << "Dopo (distanze minime):\n";
    stampa(D);
    return 0;
}
