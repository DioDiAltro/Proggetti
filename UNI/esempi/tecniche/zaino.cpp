// Zaino 0/1 con la programmazione dinamica.
//   K[i][w] = valore massimo usando solo i primi i oggetti con capacità w
//   K[0][w] = 0
//   K[i][w] = K[i-1][w]                                  se peso_i > w
//           = max(K[i-1][w], K[i-1][w - peso_i] + valore_i)  altrimenti
// Attenzione agli indici: la riga i della tabella parla dell'oggetto i
// (contando da 1), che nei vector sta in posizione i - 1.
// Costo: (n+1)(W+1) celle, ognuna in tempo costante: Θ(nW).
#include <algorithm>
#include <iostream>
#include <vector>
using namespace std;

//@region pd
int zaino(const vector<int>& peso, const vector<int>& valore, int W,
          vector<vector<int>>& K) {
    int n = peso.size();
    K.assign(n + 1, vector<int>(W + 1, 0));       //@init
    for (int i = 1; i <= n; i++) {                //@outer
        for (int w = 0; w <= W; w++) {            //@inner
            if (peso[i - 1] > w)                  //@fits
                K[i][w] = K[i - 1][w];            //@skip
            else
                K[i][w] = max(K[i - 1][w],        //@take
                              K[i - 1][w - peso[i - 1]] + valore[i - 1]);
        }
    }
    return K[n][W];                               //@ret
}

// ricostruzione: se K[i][w] != K[i-1][w] l'oggetto i è stato preso
vector<int> oggettiScelti(const vector<int>& peso, const vector<vector<int>>& K, int W) {
    vector<int> scelti;
    int w = W;
    for (int i = peso.size(); i >= 1; i--) {      //@rec-loop
        if (K[i][w] != K[i - 1][w]) {             //@rec-cmp
            scelti.push_back(i);                  //@rec-take
            w -= peso[i - 1];
        }
    }
    return scelti;
}
//@endregion

int main() {
    vector<int> peso = {1, 3, 4, 5};
    vector<int> valore = {1, 4, 5, 7};
    int W = 7;
    vector<vector<int>> K;
    int best = zaino(peso, valore, W, K);

    cout << "Tabella K[i][w]:\n";
    for (size_t i = 0; i < K.size(); i++) {
        for (int x : K[i]) {
            cout.width(3);
            cout << x;
        }
        cout << '\n';
    }
    cout << "Valore massimo: " << best << '\n';
    cout << "Oggetti scelti:";
    for (int i : oggettiScelti(peso, K, W))
        cout << "  " << i << " (peso " << peso[i - 1] << ", valore " << valore[i - 1] << ')';
    cout << '\n';
    return 0;
}
