# 0.2.1 - Debug logs (2020-08-02)

```diff
+ Add debug logging support (enable in config). **This will expose sensitive data.**

- Remove RPC timeout prevention. This should be handled automatically as a side effect of the refresh interval config value.
```

# 0.2.0 - Bug fixes (2020-08-02)

```diff
+ Add missing config entries to README
+ Add checks in Member class for no goodybag

* Fix Discord RPC error with £10 golden goodybag w/ reservetank (max 32 char asset keys)
* Fix incorrect price to string conversions (£1.05 would show as £1.50)
* Fix error if member doesn't have a current or doesn't have a queued goodybag
```

# 0.1.0 - Initial release (2020-07-22)

```diff
+ Initial release of rich presence utility
```