// Resto con il minimo numero di monete: programmazione dinamica.
//   dp[x] = numero minimo di monete per formare l'importo x
//   dp[0] = 0,   dp[x] = 1 + min { dp[x - c] : c moneta, c <= x }
// Funziona con qualsiasi insieme di monete, anche dove il greedy sbaglia.
#include <iostream>
#include <string>
#include <vector>
using namespace std;

const int INF = 1000000000;   // "infinito": importo che non si può formare

//@region pd
int minimoMonete(const vector<int>& monete, int R, vector<int>& scelta) {
    vector<int> dp(R + 1, INF);                         //@init
    scelta.assign(R + 1, 0);       // scelta[x] = moneta usata per ultima in dp[x]
    dp[0] = 0;                                          //@base
    for (int x = 1; x <= R; x++) {                      //@outer
        for (int c : monete) {                          //@inner
            if (c <= x && dp[x - c] + 1 < dp[x]) {      //@cmp
                dp[x] = dp[x - c] + 1;                  //@update
                scelta[x] = c;
            }
        }
    }
    return dp[R];                                       //@ret
}

vector<int> ricostruisci(const vector<int>& scelta, int R) {
    vector<int> usate;
    for (int x = R; x > 0; x -= scelta[x])              //@rec
        usate.push_back(scelta[x]);                     //@rec-take
    return usate;
}
//@endregion

// il greedy del capitolo precedente: monete in ordine decrescente
int restoGreedy(const vector<int>& monete, int importo) {
    int quante = 0;
    for (int c : monete)
        while (importo >= c) {
            importo -= c;
            quante++;
        }
    return importo == 0 ? quante : INF;
}

int main() {
    vector<int> monete = {1, 3, 4};
    vector<int> scelta;
    int R = 6;
    int k = minimoMonete(monete, R, scelta);
    cout << "Monete {1, 3, 4}, importo " << R << ": " << k << " monete =";
    for (int c : ricostruisci(scelta, R)) cout << ' ' << c;
    cout << '\n';

    cout << "Importi fino a 30 dove il greedy usa più monete:";
    for (int x = 1; x <= 30; x++) {
        int ottimo = minimoMonete(monete, x, scelta);
        int greedy = restoGreedy({4, 3, 1}, x);
        if (greedy != ottimo) cout << ' ' << x << " (" << greedy << " invece di " << ottimo << ')';
    }
    cout << '\n';

    vector<int> euro = {1, 2, 5, 10, 20, 50, 100, 200};
    int diversi = 0;
    for (int x = 1; x <= 500; x++)
        if (restoGreedy({200, 100, 50, 20, 10, 5, 2, 1}, x) != minimoMonete(euro, x, scelta)) diversi++;
    cout << "Euro, importi da 1 a 500 centesimi: il greedy sbaglia " << diversi << " volte\n";

    vector<int> pari = {2, 4};
    k = minimoMonete(pari, 7, scelta);
    cout << "Monete {2, 4}, importo 7: " << (k >= INF ? "impossibile" : to_string(k)) << '\n';
    return 0;
}
