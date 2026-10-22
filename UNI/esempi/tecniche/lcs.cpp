// Sottosequenza comune più lunga (LCS, longest common subsequence).
//   c[i][j] = lunghezza della LCS dei prefissi X[0..i-1] e Y[0..j-1]
//   c[i][0] = c[0][j] = 0
//   c[i][j] = c[i-1][j-1] + 1               se X[i-1] == Y[j-1]
//           = max(c[i-1][j], c[i][j-1])     altrimenti
// Costo: Θ(mn) per la tabella, Θ(m + n) per ricostruire la sottosequenza.
#include <algorithm>
#include <iostream>
#include <string>
#include <vector>
using namespace std;

//@region pd
int lcs(const string& X, const string& Y, vector<vector<int>>& c) {
    int m = X.size(), n = Y.size();
    c.assign(m + 1, vector<int>(n + 1, 0));             //@init
    for (int i = 1; i <= m; i++) {                      //@outer
        for (int j = 1; j <= n; j++) {                  //@inner
            if (X[i - 1] == Y[j - 1])                   //@cmp
                c[i][j] = c[i - 1][j - 1] + 1;          //@diag
            else
                c[i][j] = max(c[i - 1][j], c[i][j - 1]);   //@max
        }
    }
    return c[m][n];                                     //@ret
}

// si riparte dall'ultima cella e si segue da dove viene ogni valore
string ricostruisci(const string& X, const string& Y, const vector<vector<int>>& c) {
    string s;
    int i = X.size(), j = Y.size();
    while (i > 0 && j > 0) {                            //@rec-loop
        if (X[i - 1] == Y[j - 1]) {                     //@rec-cmp
            s += X[i - 1];                              //@rec-diag
            i--;
            j--;
        } else if (c[i - 1][j] >= c[i][j - 1]) {        //@rec-up
            i--;
        } else {
            j--;                                        //@rec-left
        }
    }
    reverse(s.begin(), s.end());                        //@rec-rev
    return s;
}
//@endregion

int main() {
    string X = "ABCBDAB", Y = "BDCABA";   // l'esempio del Cormen
    vector<vector<int>> c;
    int len = lcs(X, Y, c);
    cout << "X = " << X << ", Y = " << Y << '\n';
    cout << "Lunghezza della LCS: " << len << '\n';
    cout << "Una LCS: " << ricostruisci(X, Y, c) << '\n';
    return 0;
}
