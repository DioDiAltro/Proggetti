// Distanza di edit (di Levenshtein): il minimo numero di inserimenti,
// cancellazioni e sostituzioni di un carattere per trasformare X in Y.
//   d[i][j] = distanza tra i prefissi X[0..i-1] e Y[0..j-1]
//   d[i][0] = i,   d[0][j] = j
//   d[i][j] = min( d[i-1][j] + 1,              cancello X[i-1]
//                  d[i][j-1] + 1,              inserisco Y[j-1]
//                  d[i-1][j-1] + (X[i-1] != Y[j-1]) )   sostituisco o copio
// Costo: Θ(mn).
#include <algorithm>
#include <iostream>
#include <string>
#include <vector>
using namespace std;

//@region pd
int distanzaEdit(const string& X, const string& Y, vector<vector<int>>& d) {
    int m = X.size(), n = Y.size();
    d.assign(m + 1, vector<int>(n + 1, 0));
    for (int i = 0; i <= m; i++) d[i][0] = i;           //@base-col
    for (int j = 0; j <= n; j++) d[0][j] = j;           //@base-row
    for (int i = 1; i <= m; i++) {
        for (int j = 1; j <= n; j++) {
            int sost = (X[i - 1] == Y[j - 1]) ? 0 : 1;  //@cmp
            d[i][j] = min({d[i - 1][j] + 1,             //@min
                           d[i][j - 1] + 1,
                           d[i - 1][j - 1] + sost});
        }
    }
    return d[m][n];                                     //@ret
}

// ricostruzione all'indietro: preferisce la diagonale, poi la cancellazione
vector<string> operazioni(const string& X, const string& Y, const vector<vector<int>>& d) {
    vector<string> ops;
    int i = X.size(), j = Y.size();
    while (i > 0 || j > 0) {                            //@rec-loop
        if (i > 0 && j > 0 && d[i][j] == d[i - 1][j - 1] + (X[i - 1] != Y[j - 1])) {   //@rec-diag
            if (X[i - 1] == Y[j - 1]) ops.push_back(string("copio ") + X[i - 1]);
            else ops.push_back(string("sostituisco ") + X[i - 1] + " con " + Y[j - 1]);
            i--;
            j--;
        } else if (i > 0 && d[i][j] == d[i - 1][j] + 1) {   //@rec-up
            ops.push_back(string("cancello ") + X[i - 1]);
            i--;
        } else {
            ops.push_back(string("inserisco ") + Y[j - 1]);   //@rec-left
            j--;
        }
    }
    reverse(ops.begin(), ops.end());
    return ops;
}
//@endregion

int main() {
    string X = "PIANO", Y = "PANCA";
    vector<vector<int>> d;
    cout << "Distanza tra " << X << " e " << Y << ": " << distanzaEdit(X, Y, d) << '\n';
    for (const string& op : operazioni(X, Y, d)) cout << "  " << op << '\n';
    return 0;
}
