// Fibonacci in tre modi: ricorsione semplice, memoizzazione (dall'alto),
// tabulazione (dal basso). Il programma conta le chiamate e le iterazioni.
//   F(0) = 0, F(1) = 1, F(n) = F(n-1) + F(n-2)
#include <iostream>
#include <vector>
using namespace std;

long long chiamate = 0;   // solo per contare le chiamate delle versioni ricorsive

//@region ricorsiva
long long fib(int n) {
    chiamate++;
    if (n <= 1) return n;                         //@base
    return fib(n - 1) + fib(n - 2);               //@rec
}
//@endregion

//@region memo
// memo[k] = F(k) se già calcolato, -1 altrimenti
long long fibMemo(int n, vector<long long>& memo) {
    chiamate++;
    if (memo[n] != -1) return memo[n];            //@hit
    if (n <= 1) memo[n] = n;                      //@mbase
    else memo[n] = fibMemo(n - 1, memo) + fibMemo(n - 2, memo);   //@store
    return memo[n];
}
//@endregion

//@region tab
long long fibTab(int n) {
    if (n <= 1) return n;
    vector<long long> f(n + 1);
    f[0] = 0;
    f[1] = 1;
    for (int i = 2; i <= n; i++)                  //@loop
        f[i] = f[i - 1] + f[i - 2];               //@sum
    return f[n];
}
//@endregion

int main() {
    cout << " n       F(n)   chiamate (semplice)   chiamate (memo)   iterazioni\n";
    for (int n : {10, 20, 30}) {
        chiamate = 0;
        long long a = fib(n);
        long long c1 = chiamate;

        vector<long long> memo(n + 1, -1);
        chiamate = 0;
        long long b = fibMemo(n, memo);
        long long c2 = chiamate;

        long long c = fibTab(n);
        if (a != b || b != c) cout << "errore: risultati diversi\n";
        cout.width(2);
        cout << n;
        cout.width(11);
        cout << c;
        cout.width(22);
        cout << c1;
        cout.width(18);
        cout << c2;
        cout.width(13);
        cout << n - 1 << '\n';
    }
    // con long long si arriva a F(92); F(47) non sta già più in un int
    cout << "F(90) = " << fibTab(90) << '\n';
    return 0;
}
